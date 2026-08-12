<?php
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once "conexao.php"; 
$db = isset($mysqli) ? $mysqli : (isset($conn) ? $conn : null);

$sql = "SELECT idAtividades, nome FROM atividades";
$resultado = $db->query($sql);

$atividades = [];
if ($resultado) {
    while ($linha = $resultado->fetch_assoc()) {
        $atividades[] = $linha;
    }
}

echo json_encode($atividades);
?>