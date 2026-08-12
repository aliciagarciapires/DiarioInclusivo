<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexao.php';

$db = $conn ?? $conexao ?? $mysqli ?? null;

if (!$db) {
    echo json_encode(["erro" => "Falha na conexão com o banco de dados."]);
    exit;
}

$idResp = $_GET['idResp'] ?? $_GET['idUsuario'] ?? null;

if (!$idResp) {
    echo json_encode(["erro" => "ID do responsável não foi fornecido."]);
    exit;
}

try {
    $idRespInt = (int)$idResp;

    // Busca o discente onde o idResp é o usuário logado
    // (Adicionado CAST para evitar problemas de comparação int/string no MySQL)
    $query = "SELECT DISTINCT d.id, d.nome, d.data_nascimento, d.grau_de_suporte 
              FROM discente d
              INNER JOIN usuario_possui_discente upd ON d.id = upd.idDiscente
              WHERE upd.idResp = ?";

    $stmt = $db->prepare($query);
    $stmt->bind_param("i", $idRespInt);
    $stmt->execute();

    $result = $stmt->get_result();
    $discentes = [];

    while ($row = $result->fetch_assoc()) {
        $discentes[] = $row;
    }

    // Retorna a lista encontrada (ou array vazio [])
    echo json_encode($discentes);

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["erro" => "Erro na consulta SQL: " . $e->getMessage()]);
}
?>