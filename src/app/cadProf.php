<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'conexao.php';

// 1. Captura o JSON enviado
$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);

// 2. Validação básica
if (!$dados) {
    echo json_encode(["success" => false, "message" => "JSON inválido ou vazio."]);
    exit();
}

$nome = $dados['nome'] ?? '';
$email = $dados['email'] ?? '';
$senha = $dados['senha'] ?? '';
$tipoConta = $dados['tipoConta'] ?? '1';

// 3. Segurança: Use prepared statements (Obrigatório para não haver erro de SQL)
$stmt = $mysqli->prepare("INSERT INTO usuario (nome, email, senha, tipo_de_usuario) VALUES (?, ?, ?, ?)");

if ($stmt) {
    // Vincula os dados (s = string, i = inteiro)
    $stmt->bind_param("sssi", $nome, $email, $senha, $tipoConta);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Cadastro realizado com sucesso!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao inserir: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Erro na preparação da consulta: " . $mysqli->error]);
}

$mysqli->close();
?>