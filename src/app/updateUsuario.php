<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if (isset($dados['idUsuario']) && isset($dados['nome']) && isset($dados['email'])) {
    $id = $dados['idUsuario'];
    $nome = $dados['nome'];
    $email = $dados['email'];
    $telefone = $dados['telefone'] ?? '';
    $senha = $dados['senha'] ?? '';

    $stmt = $mysqli->prepare("UPDATE usuario SET nome = ?, email = ?, telefone = ?, senha = ? WHERE idUsuario = ?");
    $stmt->bind_param("ssssi", $nome, $email, $telefone, $senha, $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Dados atualizados com sucesso."]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao atualizar: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Dados incompletos fornecidos."]);
}

$mysqli->close();
?>