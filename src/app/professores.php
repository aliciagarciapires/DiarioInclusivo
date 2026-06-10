<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include 'conexao.php';

// Filtra pelo tipo que identifica o professor no seu banco
// Ajuste 'tipo_de_usuario' para o nome exato da sua coluna
// Ajuste 'professor' para o valor exato que define o professor no seu banco
$sql = "SELECT idUsuario, nome FROM usuario WHERE tipo_de_usuario = '3'"; 

$resultado = $mysqli->query($sql);

$professores = [];
while ($linha = $resultado->fetch_assoc()) {
    $professores[] = [
        "id" => $linha['idUsuario'],
        "nome" => $linha['nome'],
        "imagem" => "../../assets/images/professor.png",
        "tipo" => "professor"
    ];
}

echo json_encode($professores);
?>