<?php
// Limpa qualquer buffer ou mensagem anterior do servidor para não corromper o JSON
while (ob_get_level()) {
    ob_end_clean();
}
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inclui a conexão (ajuste o nome do arquivo se necessário)
include 'conexao.php';

$rawInput = file_get_contents("php://input");
$input = json_decode($rawInput, true);

$userId = $input['user_id'] ?? '';
$senhaAtual = $input['senha_atual'] ?? '';
$novaSenha = $input['nova_senha'] ?? '';

if (empty($userId) || empty($senhaAtual) || empty($novaSenha)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Preencha todos os campos obrigatórios."]);
    exit;
}

// 1. Busca o usuário no banco pelo ID
$stmt = $mysqli->prepare("SELECT senha FROM usuario WHERE idUsuario = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(["sucesso" => false, "mensagem" => "Usuário não encontrado."]);
    exit;
}

$dadosUsuario = $resultado->fetch_assoc();
$senhaHashBanco = $dadosUsuario['senha'];

// 2. Verifica se a senha atual digitada bate com a do banco
if (!password_verify($senhaAtual, $senhaHashBanco)) {
    echo json_encode(["sucesso" => false, "mensagem" => "A senha atual está incorreta."]);
    exit;
}

// 3. Atualiza com a nova senha criptografada
$novoHash = password_hash($novaSenha, PASSWORD_DEFAULT);
$stmtUpdate = $mysqli->prepare("UPDATE usuario SET senha = ? WHERE idUsuario = ?");
$stmtUpdate->bind_param("si", $novoHash, $userId);

if (!$stmtUpdate->execute()) {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar a senha no banco de dados."]);
    exit;
}

echo json_encode(["sucesso" => true, "mensagem" => "Senha alterada com sucesso!"]);
exit;
?>