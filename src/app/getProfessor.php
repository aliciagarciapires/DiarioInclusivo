<?php
header("Content-Type: application/json");
include 'conexao.php';

$id = $_GET['idUsuario'] ?? null;
if ($id) {
    $stmt = $mysqli->prepare("SELECT nome, email FROM usuario WHERE idUsuario = ? AND tipo_de_usuario = 3"); // Supondo 3 = professor
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode(["success" => true, "dados" => $result->fetch_assoc()]);
}
?>