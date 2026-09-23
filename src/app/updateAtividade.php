<?php
// updateAtividade.php

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
$novoNome = $dados['novoNomeAtividade'] ?? null;

if (!empty($id) && !empty($novoNome)) {
    $idLimpo = intval($id);
    $nomeLimpo = $mysqli->real_escape_string(trim($novoNome));

    // Verifica se já existe outra atividade com esse mesmo nome (usando idAtividades)
    $sqlVerifica = "SELECT idAtividades FROM atividades WHERE nome = '$nomeLimpo' AND idAtividades != $idLimpo LIMIT 1";
    $resultadoVerifica = $mysqli->query($sqlVerifica);

    if ($resultadoVerifica && $resultadoVerifica->num_rows > 0) {
        echo json_encode([
            "sucesso" => false, 
            "mensagem" => "Já existe outra atividade cadastrada com este nome!"
        ]);
        exit;
    }

    $query = "UPDATE atividades SET nome = '$nomeLimpo' WHERE idAtividades = $idLimpo";

    if ($mysqli->query($query)) {
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Atividade atualizada com sucesso!"
        ]);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao atualizar no banco de dados: " . $mysqli->error
        ]);
    }
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos para a atualização."
    ]);
}
?>