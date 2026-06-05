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
        $email = $dados['email'];
        $telefone = $dados['telefone'];
        $senha = $dados['senha'];
        $tipoConta = $dados['tipoConta']; // 1 para responsável, 2 para administrador, 3 para professor

        //INSERE OS DADOS NA TABELA "responsaveis"
        $sql = "INSERT INTO usuario (nome, email, telefone, senha, tipo_de_usuario) VALUES ('$nome', '$email', '$telefone', '$senha', '$tipoConta')";

        if ($mysqli->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Responsável cadastrado com sucesso!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro ao cadastrar responsável: " . $mysqli->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Dados inválidos!"]);
    }
?>