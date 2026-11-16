<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once "conexao.php"; //fazendo a conexão com o banco de dados

$dados = json_decode(file_get_contents("php://input"), true); //pega os dados enviados pelo corpo (body) do React Native

if (!empty($dados['idRotina'])) //verifica se o campo idRotina não está vazio
    {
    $idRotina = intval($dados['idRotina']); //garante que o ID seja um número inteiro seguro
    
    // Deleta os vínculos primeiro (as atividades associadas à rotina)
    $mysqli->query("DELETE FROM rotina_tem_atividades WHERE idRotina = $idRotina");
    
    // Deleta a rotina
    $query = "DELETE FROM rotina WHERE idRotina = $idRotina";
    if ($mysqli->query($query)) {
        echo json_encode(["sucesso" => true, "mensagem" => "Rotina deletada com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro: " . $mysqli->error]);
    }
} else { //caso não tenha id
    echo json_encode(["sucesso" => false, "mensagem" => "ID da rotina não enviado."]);
}
?>
