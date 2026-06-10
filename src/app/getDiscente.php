<?php
header("Content-Type: application/json");
include 'conexao.php';

$id = $_GET['id'] ?? null;

if ($id) {
    $stmt = $mysqli->prepare("SELECT nome, data_nascimento, grau_de_suporte FROM discente WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($row = $resultado->fetch_assoc()) {
        echo json_encode(["success" => true, "dados" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "Discente não encontrado"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID não fornecido"]);
}
?>