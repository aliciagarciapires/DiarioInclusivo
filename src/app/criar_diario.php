<?php
// Garante que nenhum aviso/erro do PHP suje o JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include_once "conexao.php";

date_default_timezone_set('America/Sao_Paulo');

// Lê os dados do corpo da requisição
$dados = json_decode(file_get_contents("php://input"), true);

if (!empty($dados['data']) && !empty($dados['idUsuario']) && !empty($dados['idDiscente'])) {
    
    $data = $mysqli->real_escape_string($dados['data']);
    $complemento = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
    $idUsuario = intval($dados['idUsuario']);
    $idDiscente = intval($dados['idDiscente']);
    
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
exit();
?>