<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'conexao.php';

$id = $_GET['id'] ?? $_GET['idUsuario'] ?? null;

if ($id) {
    // Adicionado tipo_de_usuario no SELECT
    $stmt = $mysqli->prepare("SELECT idUsuario, nome, email, telefone, senha, tipo_de_usuario FROM usuario WHERE idUsuario = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($row = $resultado->fetch_assoc()) {
        $row['telefone'] = !empty($row['telefone']) ? $row['telefone'] : "Não informado";
        $row['email'] = !empty($row['email']) ? $row['email'] : "Não informado";
        $row['senha'] = !empty($row['senha']) ? $row['senha'] : "Não informada";
        $row['tipo_de_usuario'] = (int)$row['tipo_de_usuario'];

        echo json_encode(["success" => true, "dados" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "ID não fornecido."]);
}

$mysqli->close();
?>