<?php
// deleteAtividade.php
//usa ob_start() para iniciar o buffer de saída, permitindo que você limpe qualquer saída anterior antes de enviar a resposta JSON
ob_start();
//metodos de requisição permitidos
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') //se for options entra aqui, caso contrario continua o script
    {
    ob_end_clean(); //limpa o buffer de saída para evitar que qualquer saída anterior interfira na resposta JSON
    exit(0);
}

include_once "conexao.php"; //realiza a conexão com o banco de dados

date_default_timezone_set('America/Sao_Paulo'); //define o fuso horário padrão para "America/Sao_Paulo", garantindo que todas as operações de data e hora usem o horário correto do Brasil

$dados = json_decode(file_get_contents("php://input"), true); //pega os dados enviados pelo corpo (body) do React Native
// que devem estar em formato JSON, e decodifica para um array associativo do PHP

ob_end_clean(); //limpa o buffer de saída para evitar que qualquer saída anterior interfira na resposta JSON

$id = $dados['idAtividades'] ?? null; //id da atividade a ser deletada,
// usando o operador de coalescência nula (??) para definir $id como null caso 'idAtividades' 
//não esteja presente no array $dados

if (!empty($id)) //se nao estiver nulo ou vazio, entra aqui
    {
    $idLimpo = intval($id); //garante que o ID seja um número inteiro seguro, protegendo contra SQL Injection

    $query = "DELETE FROM atividades WHERE idAtividades = $idLimpo"; //deletando a atividade do banco de dados com base no ID fornecido

    if ($mysqli->query($query)) // Se a exclusão for bem-sucedida, retorna sucesso
        {
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
} 
//caso o id esteja vazio ou nulo, retorna uma mensagem de erro
else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "ID da atividade não informado."
    ]);
}
?>