<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "diarioinclusivo";

$mysqli = new mysqli($host, $user, $pass, $dbname);

if ($mysqli->connect_error) {
    header("Content-Type: application/json");
    echo json_encode(["sucesso" => false, "mensagem" => "Falha na conexão: " . $mysqli->connect_error]);
    exit();
}

?>