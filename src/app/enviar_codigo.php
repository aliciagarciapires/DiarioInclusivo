<?php
// Garante o envio de cabeçalhos JSON e trata qualquer erro
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handler para capturar erros fatais do PHP
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro Fatal no PHP: " . $error['message'] . " na linha " . $error['line']
        ]);
    }
});

// 1. Mapeamento dos arquivos do PHPMailer sem precisar do Composer
$basePath = __DIR__ . '/PHPMailer/src/';

$fileException = $basePath . 'Exception.php';
$filePHPMailer = $basePath . 'PHPMailer.php';
$fileSMTP      = $basePath . 'SMTP.php';

if (!file_exists($fileException) || !file_exists($filePHPMailer) || !file_exists($fileSMTP)) {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Arquivos do PHPMailer nao encontrados na pasta: " . $basePath
    ]);
    exit;
}

require_once $fileException;
require_once $filePHPMailer;
require_once $fileSMTP;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// 2. Recebimento dos dados enviados pelo React Native
$rawInput = file_get_contents("php://input");
$dados = json_decode($rawInput, true);

if (!is_array($dados) || empty($dados)) {
    $dados = $_POST;
}

$email = strtolower(trim($dados['email'] ?? $dados['email_institucional'] ?? $dados['emailInstitucional'] ?? ''));

if (empty($email)) {
    echo json_encode(["sucesso" => false, "mensagem" => "O campo de e-mail e obrigatorio."]);
    exit;
}

$email = filter_var($email, FILTER_VALIDATE_EMAIL);

if (!$email) {
    echo json_encode(["sucesso" => false, "mensagem" => "Insira um e-mail valido."]);
    exit;
}

// 3. Geração do Código de Verificação de 6 dígitos
$codigo = (string) rand(100000, 999999);

// 4. Salvando o token em arquivo JSON (exatamente como o verificar_codigo.php espera)
$pastaTokens = __DIR__ . '/tokens/';
if (!is_dir($pastaTokens)) {
    mkdir($pastaTokens, 0755, true);
}

$nomeArquivo = $pastaTokens . md5($email) . '.json';
$dadosToken = [
    'codigo' => $codigo,
    'expiracao' => time() + 900 // Expira em 15 minutos (900 segundos)
];

file_put_contents($nomeArquivo, json_encode($dadosToken));

// 5. Configuração e Envio do E-mail com PHPMailer
try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'diarioinclusivo2026@gmail.com';
    $mail->Password   = 'pkio pukq lsug aybb'; 
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';
    $mail->Timeout    = 10; 

    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    $mail->setFrom('diarioinclusivo2026@gmail.com', "Diario Inclusivo");
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Seu Código de Verificação';
    
    $bodyHtml  = "<h2>Código de Confirmação</h2>";
    $bodyHtml .= "<p>Seu código de verificação para o Diário Inclusivo é:</p>";
    $bodyHtml .= "<h1 style='color: #4CAF50; letter-spacing: 2px;'>{$codigo}</h1>";
    $bodyHtml .= "<p>Este código expira em 15 minutos.</p>";

    $mail->Body = $bodyHtml;

    $mail->clearReplyTos();
    $mail->addReplyTo('diarioinclusivo2026@gmail.com', 'Diário Inclusivo');

    $mail->addCustomHeader('X-Mailer: PHP/' . phpversion());
    $mail->addCustomHeader('X-Priority: 1 (Highest)');
    $mail->addCustomHeader('Importance: High');
    
    $mail->send();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Código enviado com sucesso para o e-mail!"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Falha ao enviar e-mail: " . $mail->ErrorInfo
    ]);
}
?>