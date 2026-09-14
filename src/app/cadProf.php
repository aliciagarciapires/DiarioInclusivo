<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Trata requisições pre-flight do React Native
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexao.php';

// 1. Captura o JSON enviado
$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);

// 2. Validação básica de recebimento
if (!$dados) {
    echo json_encode(["success" => false, "message" => "JSON inválido ou vazio."]);
    exit();
}

$nome = trim($dados['nome'] ?? '');
$email = trim($dados['email'] ?? '');
$senha = $dados['senha'] ?? '';
$tipoConta = isset($dados['tipoConta']) ? (int)$dados['tipoConta'] : 1;

// Validação simples de e-mail obrigatório
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "O e-mail é obrigatório."]);
    exit();
}

if (!preg_match('/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/', $senha)) {
    echo json_encode(["success" => false, "message" => "A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 símbolo."]);
    exit();
}

// =========================================================================
// 3. Checa se o e-mail já existe na tabela 'usuario'
// =========================================================================
$sqlCheck = "SELECT idUsuario FROM usuario WHERE email = ?";
$stmtCheck = $mysqli->prepare($sqlCheck);

if ($stmtCheck) {
    $stmtCheck->bind_param("s", $email);
    $stmtCheck->execute();
    $stmtCheck->store_result();

    if ($stmtCheck->num_rows > 0) {
        echo json_encode([
            "success" => false, 
            "message" => "Este e-mail já está cadastrado."
        ]);
        $stmtCheck->close();
        $mysqli->close();
        exit();
    }
    $stmtCheck->close();
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Erro na consulta de e-mail: " . $mysqli->error
    ]);
    $mysqli->close();
    exit();
}
// =========================================================================

// 4. Inserção no banco de dados usando Prepared Statements
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare("INSERT INTO usuario (nome, email, senha, tipo_de_usuario) VALUES (?, ?, ?, ?)");

if ($stmt) {
    // Vincula os dados (s = string, i = inteiro)
    $stmt->bind_param("sssi", $nome, $email, $senhaHash, $tipoConta);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "Cadastro realizado com sucesso!",
            "id" => $mysqli->insert_id
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Erro ao inserir: " . $stmt->error
        ]);
    }
    $stmt->close();
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Erro na preparação da consulta: " . $mysqli->error
    ]);
}

$mysqli->close();
?>