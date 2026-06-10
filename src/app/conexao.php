<?php
// conexao.php
$host = "localhost"; 
$user = "root";
$pass = "";
$dbname = "diarioinclusivo";

$mysqli = new mysqli($host, $user, $pass, $dbname);

if ($mysqli->connect_error) {
    // Se der erro, joga um JSON para o React entender, e não um texto puro
    header("Content-Type: application/json");
    echo json_encode(["sucesso" => false, "mensagem" => "Falha na conexão: " . $mysqli->connect_error]);
    exit();
}
// APAGAMOS o 'echo "Conexão bem-sucedida!"' daqui de baixo!
?>