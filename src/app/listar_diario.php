<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include_once "conexao.php";

$idDiscente = isset($_GET['idDiscente']) ? intval($_GET['idDiscente']) : 0;
$data = isset($_GET['data']) ? $mysqli->real_escape_string($_GET['data']) : null;

if ($idDiscente > 0) {
    // Busca os diários ordenados do mais recente para o mais antigo
    $sql = "SELECT idDiario, DATE_FORMAT(data, '%d/%m/%Y') as data, complemento, idUsuario 
            FROM diario 
            WHERE idDiscente = $idDiscente";

    if ($data) {
        $sql .= " AND data = '$data'";
    }

    $sql .= " ORDER BY idDiario DESC";

    $resultado = $mysqli->query($sql);
    $lista = [];

    if ($resultado) {
        while ($linha = $resultado->fetch_assoc()) {
            $lista[] = $linha;
        }
        echo json_encode([
            "sucesso" => true,
            "dados" => $lista
        ]);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro na consulta: " . $mysqli->error
        ]);
    }
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "idDiscente não informado."
    ]);
}
exit();
?>