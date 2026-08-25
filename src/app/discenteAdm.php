<?php
// Libera o acesso para o React Native conseguir ler os dados
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Lida com requisições OPTIONS do navegador/app
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Puxa a sua conexão com o banco
include_once "conexao.php"; 

try {
    // 2. Faz o SELECT direto puxando TODOS 
    // (Se a sua tabela for no plural, mude para "discentes")
    $query = "SELECT * FROM discente"; 
    
    // 3. Executa a query usando a variável $mysqli do seu conexao.php
    $resultado = $mysqli->query($query); 
    
    if ($resultado) {
        // Pega todos os dados e transforma num array associativo
        $dados = $resultado->fetch_all(MYSQLI_ASSOC);
        
        // Devolve pro React Native em formato JSON
        echo json_encode($dados);
    } else {
        // Se der erro na query SQL, avisa o React Native
        echo json_encode(["erro" => "Erro na consulta: " . $mysqli->error]);
    }

} catch (Exception $e) {
    // Se der pau no PHP, ele te avisa o erro sem quebrar o JSON
    echo json_encode(["erro" => "Falha no servidor: " . $e->getMessage()]);
}
?>