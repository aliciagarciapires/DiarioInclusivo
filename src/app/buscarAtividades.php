<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json"); //conexão com o banco

include_once "conexao.php";

$dados = json_decode(file_get_contents("php://input"), true);

$sql = "SELECT idAtividades, nome FROM atividades";
$result = $mysqli->query($sql);

$atividades = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $atividades[] = array(
            "idAtividades" => $row["idAtividades"],
            "nome" => $row["nome"]
        );
    }
}

echo json_encode($atividades);
?>