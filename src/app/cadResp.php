<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(0);

include('conexao.php');

$input = file_get_contents("php://input");
$dados = json_decode($input, true);

if (!$dados) {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado enviado."]);
    exit();
}

$nome           = $dados['nome'] ?? '';
$email          = $dados['email'] ?? '';
$telefone       = $dados['telefone'] ?? '';
$senha          = $dados['senha'] ?? '';
$confirmarSenha = $dados['confirmarSenha'] ?? '';

// Validação simples
if (empty($nome) || empty($email) || empty($senha)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Preencha todos os campos."]);
    exit();
}

if ($senha !== $confirmarSenha) {
    echo json_encode(["sucesso" => false, "mensagem" => "As senhas não coincidem."]);
    exit();
}

// Criptografia e Inserção

$stmt = $mysqli->prepare("INSERT INTO usuario (nome, email, telefone, senha) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nome, $email, $telefone, $senha);

// Substitua o bloco if final do seu cadResp.php por este:

if ($stmt->execute()) {
    $idInserido = $mysqli->insert_id; // Pega o ID que o banco acabou de criar
    echo json_encode([
        "sucesso" => true, 
        "mensagem" => "Cadastro realizado com sucesso! ID no banco: " . $idInserido
    ]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $mysqli->error]);
}
?>