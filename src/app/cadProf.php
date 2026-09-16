<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "conexao.php";

$entrada = file_get_contents("php://input");

$dados = json_decode($entrada, true);

if (!$dados) {
    echo json_encode([
        "success" => false,
        "message" => "Dados inválidos."
    ]);
    exit;
}

$nome = $dados["nome"] ?? "";
$email = $dados["email"] ?? "";
$senha = $dados["senha"] ?? "";
$tipoConta = $dados["tipoConta"] ?? "";
$aceitouTermos = $dados["aceitouTermos"] ?? false;

if (!$aceitouTermos) {
    echo json_encode([
        "success" => false,
        "message" => "É necessário aceitar os Termos de Uso."
    ]);
    exit;
}

if (empty($nome) || empty($email) || empty($senha) || empty($tipoConta)) {
    echo json_encode([
        "success" => false,
        "message" => "Preencha todos os campos."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "E-mail inválido."
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
        "success" => false,
        "message" => "Este e-mail já está cadastrado."
    ]);
    exit;
}

$sql = "INSERT INTO usuario
        (nome, email, senha, tipo_de_usuario)
        VALUES (?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);

$stmt->bind_param(
    "sssi",
    $nome,
    $email,
    $senha,
    $tipoConta
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Cadastro realizado com sucesso!",
        "id" => $stmt->insert_id
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Erro ao realizar cadastro: " . $stmt->error
    ]);
}

$stmt->close();
$mysqli->close();

?>