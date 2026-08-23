<?php
// criar_diario.php

ob_start();

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

include_once "conexao.php";

$mysqli->query("SET FOREIGN_KEY_CHECKS = 0;");

date_default_timezone_set('America/Sao_Paulo');

$dados = json_decode(file_get_contents("php://input"), true);
ob_end_clean();

if (!empty($dados['data']) && !empty($dados['idUsuario']) && !empty($dados['idDiscente'])) {
    
    $data = $mysqli->real_escape_string($dados['data']);
    $complemento = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
    $idUsuario = intval($dados['idUsuario']);
    $idDiscente = intval($dados['idDiscente']);
    
    // Nome da tabela ajustado para minúsculo conforme o MySQL
    $queryDiario = "INSERT INTO diario (data, complemento, idUsuario, idDiscente) 
                    VALUES ('$data', '$complemento', $idUsuario, $idDiscente)";
    
    if ($mysqli->query($queryDiario)) {
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Diário salvo com sucesso!",
            "idDiario" => $mysqli->insert_id
        ]);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao salvar no banco: " . $mysqli->error
        ]);
    }
    
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos fornecidos."
    ]);
}
?>