<?php
// salvar_rotina.php

// Evita que qualquer aviso ou erro PHP "suje" a resposta JSON
ob_start();

// Cabeçalhos de permissão (CORS) para o React Native conseguir acessar
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json"); 

// Se for uma requisição de verificação do navegador (OPTIONS), encerra aqui
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

// Inclui a sua conexão com o banco de dados
include_once "conexao.php";

$mysqli->query("SET FOREIGN_KEY_CHECKS = 0;"); //ignorar temporaraiamente o idUsuario


// Define o fuso horário padrão
date_default_timezone_set('America/Sao_Paulo');

// Pega os dados enviados pelo corpo (body) do React Native
$dados = json_decode(file_get_contents("php://input"), true);
ob_end_clean();

// Verifica se todos os campos obrigatórios chegaram do aplicativo
if (!empty($dados['nomeRotina']) && !empty($dados['atividades']) && !empty($dados['idUsuario'])) {
    
    // Protege os dados contra SQL Injection
    $nomeRotina = $mysqli->real_escape_string($dados['nomeRotina']);
    $idUsuario = intval($dados['idUsuario']); // Transforma em número inteiro seguro
    
    // 1. Insere a nova rotina na tabela ROTINA vinculando ao idUsuario
    $queryRotina = "INSERT INTO ROTINA (nome, idUsuario) VALUES ('$nomeRotina', $idUsuario)";
    
    if ($mysqli->query($queryRotina)) {
        // Pega o ID automático que o banco acabou de gerar para esta rotina
        $idRotinaGerado = $mysqli->insert_id; 
        
        $erroVinculo = false;
        $mensagemErro = "";
        
        // 2. Faz um loop para salvar cada atividade selecionada na tabela de relacionamento (ROTINA_TEM_ATIVIDADES)
        foreach ($dados['atividades'] as $atividade) {
            $idAtividade = intval($atividade['idAtividades']);
            $horaInicial = $mysqli->real_escape_string($atividade['horaInicial']);
            $horaFinal = $mysqli->real_escape_string($atividade['horaFinal']);
            
            // Query que junta o ID da rotina criada, o ID da atividade existente e as horas
            $queryVinculo = "INSERT INTO ROTINA_TEM_ATIVIDADES (idRotina, idAtividades, horas_iniciais, horas_finais) 
                             VALUES ($idRotinaGerado, $idAtividade, '$horaInicial', '$horaFinal')";
            
            if (!$mysqli->query($queryVinculo)) {
                $erroVinculo = true;
                $mensagemErro = $mysqli->error;
                break; // Se der erro em alguma atividade, para o loop imediatamente
            }
        }
        
        // Verifica se deu tudo certo no loop de salvamento das horas
        if (!$erroVinculo) {
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Rotina e todas as atividades foram salvas com sucesso!"
            ]);
        } else {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "A rotina foi criada, mas houve um erro ao salvar os horários: " . $mensagemErro
            ]);
        }
        
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao criar a rotina no banco de dados: " . $mysqli->error
        ]);
    }
    
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos. Certifique-se de preencher o nome, selecionar atividades e enviar o usuário."
    ]);
}
?>