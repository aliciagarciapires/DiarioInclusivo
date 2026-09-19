<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once "conexao.php";

$dados = json_decode(file_get_contents("php://input"), true);

if (!empty($dados['idAtividades'])) {  //Verifica se o aplicativo enviou o parâmetro idAtividades e se ele não está vazio
    $idAtividade = intval($dados['idAtividades']);
    
    // Remove também dos vínculos com as rotinas se necessário
    $mysqli->query("DELETE FROM rotina_tem_atividades WHERE idAtividades = $idAtividade");
    
    $query = "DELETE FROM atividades WHERE idAtividades = $idAtividade";
    if ($mysqli->query($query)) {
        echo json_encode(["sucesso" => true, "mensagem" => "Atividade removida!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro: " . $mysqli->error]);
    }
} else { //caso não tenha id
    echo json_encode(["sucesso" => false, "mensagem" => "ID não informado."]);
}
?>
