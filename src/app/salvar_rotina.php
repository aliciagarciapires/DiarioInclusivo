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
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') //verifica se a requisição é do tipo OPTIONS, que é enviada pelo navegador antes de uma requisição POST para verificar permissões
     {
    ob_end_clean();
    exit(0);
}

// Inclui a sua conexão com o banco de dados
$transacaoIniciada = false;
try {
include_once "conexao.php";

// Define o fuso horário padrão
date_default_timezone_set('America/Sao_Paulo');

// Pega os dados enviados pelo corpo (body) do React Native para o PHP, que devem estar em formato JSON
$dados = json_decode(file_get_contents("php://input"), true);

ob_end_clean();

// Verifica se todos os campos obrigatórios chegaram do aplicativo
if (!empty($dados['nome']) && !empty($dados['atividades']) && !empty($dados['idUsuario'])) {
    
    // Protege os dados contra SQL Injection
    $nome = $mysqli->real_escape_string($dados['nome']); // Transforma em string segura
    $idUsuario = intval($dados['idUsuario']); // Transforma em número inteiro seguro
    if (!$mysqli->begin_transaction()) // Inicia uma transação para garantir que todas as operações sejam concluídas com sucesso ou revertidas em caso de erro
        {
        throw new RuntimeException($mysqli->error); // Se não conseguir iniciar a transação, lança uma exceção com o erro do MySQL
    }
    $transacaoIniciada = true; //Coloca a variável de controle como verdadeira, para saber que a transação foi iniciada e precisa ser finalizada ou revertida
    
    // 1. Insere a nova rotina na tabela ROTINA vinculando ao idUsuario
    $queryRotina = "INSERT INTO rotina (nome, idUsuario) VALUES ('$nome', $idUsuario)";
    
    if ($mysqli->query($queryRotina)) // Se a rotina foi inserida com sucesso, continua para salvar as atividades vinculadas
         {
        // Pega o ID automático que o banco acabou de gerar para esta rotina
        $idRotinaGerado = $mysqli->insert_id; 
        
        $erroVinculo = false; // Variável de controle para verificar se houve erro ao salvar os horários das atividades
        $mensagemErro = "";
        
        // 2. Faz um loop para salvar cada atividade selecionada na tabela de relacionamento (ROTINA_TEM_ATIVIDADES)
        foreach ($dados['atividades'] as $atividade) // Para cada atividade enviada pelo app, faz o seguinte
            {
            $idAtividade = intval($atividade['idAtividades']); // Transforma em número inteiro seguro
            $horas_iniciais = $mysqli->real_escape_string($atividade['horas_iniciais']); // Transforma em string segura
            $horas_finais = $mysqli->real_escape_string($atividade['horas_finais']); // Transforma em string segura
            
            // Query que junta o ID da rotina criada, o ID da atividade existente e as horas
            $queryVinculo = "INSERT INTO rotina_tem_atividades (idRotina, idAtividades, horas_iniciais, horas_finais) 
                             VALUES ($idRotinaGerado, $idAtividade, '$horas_iniciais', '$horas_finais')";
            
            if (!$mysqli->query($queryVinculo)) // Se der erro ao salvar o vínculo da atividade, marca a variável de erro e guarda a mensagem do MySQL
                {
                $erroVinculo = true;
                $mensagemErro = $mysqli->error;
                break; // Se der erro em alguma atividade, para o loop imediatamente
            }
        }
        
        // Verifica se deu tudo certo no loop de salvamento das horas
        if (!$erroVinculo) {
            if (!$mysqli->commit()) // commit finaliza a transação, gravando todas as alterações no banco de dados. 
                //Se não conseguir finalizar a transação, lança uma exceção com o erro do MySQL
                {
                throw new RuntimeException($mysqli->error); // Se não conseguir finalizar a transação, lança uma exceção com o erro do MySQL vai direto pro catch
            }
            $transacaoIniciada = false;
            //Coloca a variável de controle como falsa, para saber que a transação foi finalizada com sucesso
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Rotina e todas as atividades foram salvas com sucesso!"
            ]);
        } else 
        //caso de erro ao salvar os horários das atividades, faz rollback e retorna erro
        {
            $mysqli->rollback();
            $transacaoIniciada = false;
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "A rotina não foi salva. Erro ao salvar os horários: " . $mensagemErro
            ]);
        }
        
    } else 
    //caso de erro ao salvar a rotina, faz rollback e retorna erro
    {
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
}
//caso de erro inesperado, faz rollback e retorna erro
catch (Throwable $erro) {
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
