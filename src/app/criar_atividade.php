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

include_once "conexao.php"; //fazendo a conexão com o banco de dados

date_default_timezone_set('America/Sao_Paulo'); //horario brasilia

$dados = json_decode(file_get_contents("php://input"), true); //pega os dados enviados pelo corpo (body) do React Native

ob_end_clean(); //limpa o buffer de saída para evitar que qualquer saída anterior interfira na resposta JSON

if (!empty($dados['novoNomeAtividade'])) //verifica se o campo novoNomeAtividade não está vazio
    {
    
    $nomeAtividade = trim($dados['novoNomeAtividade']); //remove espaços em branco do início e do fim do nome da atividade
    $nomeLimpo = $mysqli->real_escape_string($nomeAtividade); //protege contra SQL Injection, escapando caracteres especiais no nome da atividade
    
    // 1. Verifica se já existe uma atividade com esse mesmo nome
    $sqlVerifica = "SELECT idAtividades FROM atividades WHERE nome = '$nomeLimpo' LIMIT 1";
    $resultadoVerifica = $mysqli->query($sqlVerifica);

    if ($resultadoVerifica && $resultadoVerifica->num_rows > 0) {
        // Se já existir, retorna um erro informando
        echo json_encode([
            "sucesso" => false, 
            "mensagem" => "Já existe uma atividade cadastrada com este nome!"
        ]);
        exit;
    }
    
    // 2. Se não existir, prossegue com a inserção
    $query = "INSERT INTO atividades (nome) VALUES ('$nomeLimpo')";
    
    if ($mysqli->query($query)) {
        $idGerado = $mysqli->insert_id; // Pega o ID automático gerado pelo banco de dados para a nova atividade

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