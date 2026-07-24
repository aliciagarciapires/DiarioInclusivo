<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'conexao.php';

// Aceita 'id' ou 'idUsuario' via GET ou via JSON POST
$input = json_decode(file_get_contents("php://input"), true);
$id = $_GET['id'] ?? $_GET['idUsuario'] ?? $input['id'] ?? $input['idUsuario'] ?? null;

if ($id) {
    try {
        $stmt = $mysqli->prepare("DELETE FROM usuario WHERE idUsuario = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Conta excluída com sucesso."
                ]);
            } else {
                echo json_encode([
                    "success" => false, 
                    "message" => "Nenhum usuário encontrado com este ID."
                ]);
            }
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Erro ao executar exclusão: " . $stmt->error
            ]);
        }

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false, 
            "message" => "Erro no banco de dados (Verifique restrições de Chave Estrangeira/FK): " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false, 
        "message" => "ID do usuário não fornecido."
    ]);
}

$mysqli->close();
?>