<?php
// deleteAtividade.php

ob_start();

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

include_once "conexao.php";

date_default_timezone_set('America/Sao_Paulo');

$dados = json_decode(file_get_contents("php://input"), true);

ob_end_clean();

$id = $dados['idAtividades'] ?? null;

if (!empty($id)) {
    $idLimpo = intval($id);

    $query = "DELETE FROM atividades WHERE idAtividades = $idLimpo";

    if ($mysqli->query($query)) {
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Atividade excluída com sucesso!"
        ]);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao excluir no banco de dados: " . $mysqli->error
        ]);
    }
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "ID da atividade não informado."
    ]);
}
?>