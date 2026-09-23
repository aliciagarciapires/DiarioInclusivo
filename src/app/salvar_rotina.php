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
$transacaoIniciada = false;
try {
include_once "conexao.php";

// Define o fuso horário padrão
date_default_timezone_set('America/Sao_Paulo');

// Pega os dados enviados pelo corpo (body) do React Native
$dados = json_decode(file_get_contents("php://input"), true);
ob_end_clean();

// Verifica se todos os campos obrigatórios chegaram do aplicativo
if (!empty($dados['nome']) && !empty($dados['atividades']) && !empty($dados['idUsuario'])) {
    
    // Protege os dados contra SQL Injection
    $nome = $mysqli->real_escape_string($dados['nome']);
    $idUsuario = intval($dados['idUsuario']); // Transforma em número inteiro seguro
    if (!$mysqli->begin_transaction()) {
        throw new RuntimeException($mysqli->error);
    }
    $transacaoIniciada = true;
    
    // 1. Insere a nova rotina na tabela ROTINA vinculando ao idUsuario
    $queryRotina = "INSERT INTO rotina (nome, idUsuario) VALUES ('$nome', $idUsuario)";
    
    if ($mysqli->query($queryRotina)) {
        // Pega o ID automático que o banco acabou de gerar para esta rotina
        $idRotinaGerado = $mysqli->insert_id; 
        
        $erroVinculo = false;
        $mensagemErro = "";
        
        // 2. Faz um loop para salvar cada atividade selecionada na tabela de relacionamento (ROTINA_TEM_ATIVIDADES)
        foreach ($dados['atividades'] as $atividade) {
            $idAtividade = intval($atividade['idAtividades']);
            $horas_iniciais = $mysqli->real_escape_string($atividade['horas_iniciais']);
            $horas_finais = $mysqli->real_escape_string($atividade['horas_finais']);
            
            // Query que junta o ID da rotina criada, o ID da atividade existente e as horas
            $queryVinculo = "INSERT INTO rotina_tem_atividades (idRotina, idAtividades, horas_iniciais, horas_finais) 
                             VALUES ($idRotinaGerado, $idAtividade, '$horas_iniciais', '$horas_finais')";
            
            if (!$mysqli->query($queryVinculo)) {
                $erroVinculo = true;
                $mensagemErro = $mysqli->error;
                break; // Se der erro em alguma atividade, para o loop imediatamente
            }
        }
        
        // Verifica se deu tudo certo no loop de salvamento das horas
        if (!$erroVinculo) {
            if (!$mysqli->commit()) {
                throw new RuntimeException($mysqli->error);
            }
            $transacaoIniciada = false;
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Rotina e todas as atividades foram salvas com sucesso!"
            ]);
        } else {
            $mysqli->rollback();
            $transacaoIniciada = false;
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "A rotina não foi salva. Erro ao salvar os horários: " . $mensagemErro
            ]);
        }
        
    } else {
        $mysqli->rollback();
        $transacaoIniciada = false;
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
} catch (Throwable $erro) {
    if ($transacaoIniciada) {
        $mysqli->rollback();
    }
    if (ob_get_level() > 0) {
        ob_end_clean();
    }

    http_response_code(500);
    error_log("Erro em salvar_rotina.php: " . $erro->getMessage());
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro interno ao salvar a rotina: " . $erro->getMessage()
    ]);
}
?>
