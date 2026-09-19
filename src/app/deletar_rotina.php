<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once "conexao.php";

$dados = json_decode(file_get_contents("php://input"), true);

if (!empty($dados['idRotina'])) {
    $idRotina = intval($dados['idRotina']);
    
    // Deleta os vínculos primeiro
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
