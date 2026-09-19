<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }
require_once "conexao.php";
$dados = json_decode(file_get_contents("php://input"), true);
if (!is_array($dados)) { echo json_encode(["sucesso" => false, "mensagem" => "Dados inválidos."]); exit; }
$nome = trim($dados["nome"] ?? "");
$email = strtolower(trim($dados["email"] ?? ""));
$telefone = trim($dados["telefone"] ?? "");
$senha = $dados["senha"] ?? "";
$confirmarSenha = $dados["confirmarSenha"] ?? "";
$tipoConta = (int) ($dados["tipoConta"] ?? 1);
$aceitouTermos = filter_var($dados["aceitouTermos"] ?? false, FILTER_VALIDATE_BOOLEAN);
if (!$aceitouTermos) { echo json_encode(["sucesso" => false, "mensagem" => "É necessário aceitar os Termos de Uso."]); exit; }
if (!$nome || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$senha) { echo json_encode(["sucesso" => false, "mensagem" => "Preencha os campos obrigatórios corretamente."]); exit; }
if ($senha !== $confirmarSenha) { echo json_encode(["sucesso" => false, "mensagem" => "As senhas não coincidem."]); exit; }
if (!preg_match('/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/', $senha)) { echo json_encode(["sucesso" => false, "mensagem" => "A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 símbolo."]); exit; }
$verificar = $mysqli->prepare("SELECT idUsuario FROM usuario WHERE email = ?");
$verificar->bind_param("s", $email);
$verificar->execute();
if ($verificar->get_result()->num_rows > 0) { echo json_encode(["sucesso" => false, "mensagem" => "Este e-mail já está cadastrado."]); exit; }
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare("INSERT INTO usuario (nome, email, telefone, senha, tipo_de_usuario) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $nome, $email, $telefone, $senhaHash, $tipoConta);
if ($stmt->execute()) { echo json_encode(["sucesso" => true, "mensagem" => "Cadastro realizado com sucesso!", "id" => $stmt->insert_id]); }
else { echo json_encode(["sucesso" => false, "mensagem" => "Erro ao realizar cadastro: " . $stmt->error]); }
$stmt->close();
$mysqli->close();
?>
