<?php
$host = "172.20.0.3";
$user = "diarioinclusivo_user";
$pass = "7,T!6JkU%o";
$dbname = "diarioinclusivo_banco";

$mysqli = new mysqli($host, $user, $pass, $dbname);

if ($mysqli->connect_error) {
    header("Content-Type: application/json");
    echo json_encode(["sucesso" => false, "mensagem" => "Falha na conexão: " . $mysqli->connect_error]);
    exit();
}

?>
