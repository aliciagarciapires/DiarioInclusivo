<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexao.php';

$db = $conn ?? $conexao ?? $mysqli ?? null;

if (!$db) {
    echo json_encode(["erro" => "Erro na conexão com o banco."]);
    exit;
}

// Aceita idUsuario ou id no parâmetro GET
$idUsuario = $_GET['idUsuario'] ?? $_GET['id'] ?? null;

if (!$idUsuario) {
    echo json_encode(["erro" => "ID do usuário não fornecido."]);
    exit;
}

try {
    // Busca os discentes onde o idUsuario da própria tabela discente é igual ao fornecido
    $query = "SELECT id, nome, data_nascimento, grau_de_suporte, idUsuario 
              FROM discente 
              WHERE idUsuario = ?";

    $stmt = $db->prepare($query);
    $idUsuarioInt = (int)$idUsuario;
    $stmt->bind_param("i", $idUsuarioInt);
    $stmt->execute();

    $result = $stmt->get_result();
    $discentes = [];

    while ($row = $result->fetch_assoc()) {
        $discentes[] = $row;
    }

    echo json_encode($discentes);
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["erro" => "Erro na consulta: " . $e->getMessage()]);
}
?>