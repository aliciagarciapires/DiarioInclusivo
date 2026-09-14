<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexao.php';

$input = json_decode(file_get_contents("php://input"), true);
$email = strtolower(trim($input['email'] ?? ''));
$codigoInformado = (string) ($input['codigo'] ?? '');
$novaSenha = $input['nova_senha'] ?? '';

if (empty($email) || empty($codigoInformado)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Preencha o e-mail e o código."]);
    exit;
}

$nomeArquivo = __DIR__ . '/tokens/' . md5($email) . '.json';

if (!file_exists($nomeArquivo)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum código solicitado ou código expirado."]);
    exit;
}

$dadosToken = json_decode(file_get_contents($nomeArquivo), true);

if (time() > ($dadosToken['expiracao'] ?? 0)) {
    @unlink($nomeArquivo);
    echo json_encode(["sucesso" => false, "mensagem" => "O código expirou. Solicite um novo."]);
    exit;
}

if (($dadosToken['codigo'] ?? '') !== $codigoInformado) {
    echo json_encode(["sucesso" => false, "mensagem" => "Código incorreto."]);
    exit;
}

// 1. SE A SENHA ESTIVER VAZIA: É a Tela 2 apenas testando se o código está certo
if (empty($novaSenha)) {
    echo json_encode(["sucesso" => true, "mensagem" => "Código válido!"]);
    exit;
}

// 2. SE A SENHA FOI ENVIADA: É a Tela 3 finalizando e alterando no banco
$senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare("UPDATE usuario SET senha = ? WHERE email = ?");
$stmt->bind_param("ss", $senhaHash, $email);

if (!$stmt->execute()) {
    echo json_encode(["sucesso" => false, "mensagem" => "Não foi possível atualizar a senha."]);
    exit;
}

// Apaga o arquivo de token após o uso bem-sucedido
@unlink($nomeArquivo);

echo json_encode(["sucesso" => true, "mensagem" => "Senha alterada com sucesso!"]);
?>