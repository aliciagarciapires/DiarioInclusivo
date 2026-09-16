<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once "conexao.php";

$entrada = file_get_contents("php://input");

$dados = json_decode($entrada, true);

if (!$dados) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados inválidos."
    ]);
    exit;
}

$nome = $dados["nome"] ?? "";
$email = $dados["email"] ?? "";
$telefone = $dados["telefone"] ?? "";
$senha = $dados["senha"] ?? "";
$confirmarSenha = $dados["confirmarSenha"] ?? "";
$aceitouTermos = filter_var($dados["aceitouTermos"] ?? false, FILTER_VALIDATE_BOOLEAN);

if (!$aceitouTermos) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "É necessário aceitar os Termos de Uso."
    ]);
    exit;
}

if (empty($nome) || empty($email) || empty($senha)) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Preencha todos os campos obrigatórios."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "E-mail inválido."
    ]);
    exit;
}

if ($senha !== $confirmarSenha) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "As senhas não coincidem."
    ]);
    exit;
}

$verificar = $mysqli->prepare(
    "SELECT idUsuario FROM usuario WHERE email = ?"
);

$verificar->bind_param("s", $email);
$verificar->execute();

$resultado = $verificar->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Este e-mail já está cadastrado."
    ]);
    exit;
}

$tipoConta = $dados["tipoConta"] ?? 1;

$sql = "INSERT INTO usuario
        (nome, email, telefone, senha, tipo_de_usuario)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);

$stmt->bind_param(
    "ssssi",
    $nome,
    $email,
    $telefone,
    $senha,
    $tipoConta
);

if ($stmt->execute()) {

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Cadastro realizado com sucesso!",
        "id" => $stmt->insert_id
    ]);

} else {

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao realizar cadastro: " . $stmt->error
    ]);
}
$stmt->close();
$mysqli->close();

?>
