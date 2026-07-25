<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'conexao.php';

$id = $_GET['id'] ?? null;

if ($id) {
    // Prepara a query de exclusão na tabela discente
    $stmt = $mysqli->prepare("DELETE FROM discente WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Discente excluído com sucesso."]);
        } else {
            echo json_encode(["success" => false, "message" => "Discente não encontrado."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Erro no banco de dados: " . $mysqli->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "ID não fornecido."]);
}

$mysqli->close();
?>