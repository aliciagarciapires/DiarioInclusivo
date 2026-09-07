<?php
// criar_atividade.php

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

date_default_timezone_set('America/Sao_Paulo');

$dados = json_decode(file_get_contents("php://input"), true);

ob_end_clean();

// AJUSTADO: Agora o PHP lê a chave 'novoNomeAtividade' que vem do seu React Native
if (!empty($dados['novoNomeAtividade'])) {
    
    $nomeAtividade = $dados['novoNomeAtividade'];
    $nomeLimpo = $mysqli->real_escape_string($nomeAtividade);
    
    // Insere apenas na tabela geral de ATIVIDADES, igual à estrutura do seu banco
    $query = "INSERT INTO atividades (nome) VALUES ('$nomeLimpo')";
    
    if ($mysqli->query($query)) {
        // Pega o ID gerado pelo banco de dados
        $idGerado = $mysqli->insert_id;

        echo json_encode([
            "sucesso" => true, 
            "idAtividades" => $idGerado, 
            "mensagem" => "Atividade cadastrada com sucesso!"
        ]);
    } else {
        echo json_encode([
            "sucesso" => false, 
            "mensagem" => "Erro no banco de dados: " . $mysqli->error
        ]);
    }
} else {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Dados incompletos. O campo novoNomeAtividade não foi enviado."
    ]);
}
?>