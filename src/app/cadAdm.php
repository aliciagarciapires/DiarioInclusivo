<?php
// Garante o envio de cabeçalhos JSON e trata qualquer erro de tempo/memória
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handler para capturar erros fatais do PHP que deixam a tela em branco
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro Fatal no PHP: " . $error['message'] . " na linha " . $error['line']
        ]);
    }
});

// 1. Tenta incluir o arquivo conexao.php
try {
    if (file_exists("conexao.php")) {
        include_once "conexao.php";
    }
} catch (Throwable $e) {
    // Silencia o erro de banco
}

// 2. Mapeamento de arquivos com caminho absoluto seguro
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

// 3. Recebimento dos dados do React Native
$rawInput = file_get_contents("php://input");
$dados = json_decode($rawInput, true);

if (!is_array($dados) || empty($dados)) {
    $dados = $_POST;
}

if (empty($dados)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado recebido pelo servidor."]);
    exit;
}

// 4. Sanitização e Validação dos Campos
$nomeEscola = $dados['nome_escola'] ?? $dados['nomeEscola'] ?? '';
$emailInst  = $dados['email_institucional'] ?? $dados['emailInstitucional'] ?? '';
$emailAdm   = $dados['email_adm'] ?? $dados['emailAdm'] ?? '';
$senha      = $dados['senha_adm'] ?? $dados['senhaAdm'] ?? '';

if (empty($nomeEscola) || empty($emailInst) || empty($emailAdm) || empty($senha)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Preencha todos os campos obrigatorios."]);
    exit;
}

$nomeEscola = filter_var($nomeEscola, FILTER_SANITIZE_SPECIAL_CHARS);
$emailInst  = filter_var($emailInst, FILTER_VALIDATE_EMAIL);
$emailAdm   = filter_var($emailAdm, FILTER_VALIDATE_EMAIL);

if (!$emailInst || !$emailAdm) {
    echo json_encode(["sucesso" => false, "mensagem" => "Insira e-mails validos."]);
    exit;
}

// 5. Configuração e Envio do PHPMailer
try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'aliciagarciapiress@gmail.com';
    $mail->Password   = 'kvpd shfv gfaz rmyv'; 
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

    $mail->setFrom('aliciagarciapiress@gmail.com', "App: " . $nomeEscola);
    
    // O e-mail de destino 
    $mail->addAddress('aliciagarciapiress@gmail.com');

    // vá para o e-mail da instituição, e não para o seu próprio e-mail
    $mail->addReplyTo($emailInst, $nomeEscola);

    $mail->isHTML(true);
    $mail->Subject = 'Nova Solicitacao de Cadastro - Diario Inclusivo';
    
    $bodyHtml  = "<h2>Nova Solicitacao de Cadastro de Administrador</h2>";
    $bodyHtml .= "<p><b>Nome da Escola:</b> " . htmlspecialchars($nomeEscola) . "</p>";
    $bodyHtml .= "<p><b>E-mail Institucional:</b> " . htmlspecialchars($emailInst) . "</p>";
    $bodyHtml .= "<p><b>E-mail do Administrador:</b> " . htmlspecialchars($emailAdm) . "</p>";
    $bodyHtml .= "<p><b>Senha Solicitada:</b> " . htmlspecialchars($senha) . "</p>";


    $mail->Body = $bodyHtml;

    $mail->send();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Solicitacao enviada com sucesso!"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Falha no envio de e-mail: " . $mail->ErrorInfo
    ]);
} catch (Throwable $t) {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Erro generico no servidor: " . $t->getMessage()
    ]);
}
?>