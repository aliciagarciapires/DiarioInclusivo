<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include 'conexao.php';

// Busca tudo da tabela discente
$sql = "SELECT id, nome FROM discente"; 
$resultado = $mysqli->query($sql);

$discentes = [];
while ($linha = $resultado->fetch_assoc()) {
    $discentes[] = [
        "id" => (string)$linha['id'],
        "nome" => $linha['nome'],
        "imagem" => "../../assets/images/discente.png", // Imagem padrão
        "tipo" => "discente"
    ];
}

echo json_encode($discentes);
?>