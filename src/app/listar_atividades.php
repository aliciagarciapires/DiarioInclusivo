<?php
// listar_atividades.php
header("Content-Type: application/json");
include_once "conexao.php";

// Limpa o "Conexão bem-sucedida!" do conexao.php para não quebrar o React Native
ob_clean(); 

try {
    // Mudamos para $mysqli para conversar com o seu conexao.php
    $query = "SELECT idAtividades, nome FROM ATIVIDADES";
    $result = $mysqli->query($query);

    if (!$result) { //caso não consiga executar a busca gera a msg de erro
        throw new Exception($mysqli->error);
    }
    
    // Transforma os resultados do banco em um array
    $atividades = $result->fetch_all(MYSQLI_ASSOC);

    // Devolve a lista certinha em JSON para o seu React Native
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