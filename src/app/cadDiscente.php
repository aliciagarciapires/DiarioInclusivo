<?php
    //CONEXÃO COM conexao.php PARA USAR O $mysqli
    include 'conexao.php';

    $conteudo = file_get_contents("php://input");
    if (empty($conteudo)) {
        die(json_encode(["mensagem" => "Nenhum dado recebido pelo servidor"]));
    }

    //RECEBE OS DADOS ENVIADOS PELO FRONT-END (CADASTRO DE RESPONSÁVEL)
    $dados = json_decode(file_get_contents("php://input"), true);

    if ($dados) {
        $nome = $dados['nome'];
        $dataNasc = $dados['dataNasc'];

        //INSERE OS DADOS NA TABELA "responsaveis"
        $sql = "INSERT INTO discente (nome, data_nascimento) VALUES ('$nome', '$dataNasc')";

        if ($mysqli->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Discente cadastrado com sucesso!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro ao cadastrar discente: " . $mysqli->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Dados inválidos!"]);
    }
?>