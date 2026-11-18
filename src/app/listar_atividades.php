<?php
// listar_atividades.php
header("Content-Type: application/json");
include_once "conexao.php";

ob_clean(); 

try {
    // Faz a consulta SQL para buscar todas as atividades
    $query = "SELECT idAtividades, nome FROM atividades";
    // Executa a consulta SQL
    $result = $mysqli->query($query);

    if (!$result) { //caso não consiga executar a busca gera a msg de erro
        throw new Exception($mysqli->error); //vai direto pro catch
    }
    
    // Transforma os resultados do banco em um array associativo
    $atividades = $result->fetch_all(MYSQLI_ASSOC);

    // Devolve a lista certinha em JSON
    echo json_encode([
        "sucesso" => true,
        "dados" => $atividades
    ]);

} catch (Exception $e) { //se der erro no try, devolve a msg de erro em JSON
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Erro ao buscar: " . $e->getMessage()
    ]);
}
?>