<?php
ob_start();

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

include_once "conexao.php";

if (isset($mysqli)) {
    $mysqli->set_charset("utf8");
}

date_default_timezone_set('America/Sao_Paulo');
ob_clean();

$dados = json_decode(file_get_contents("php://input"), true);

$dataBruta     = $dados['data'] ?? null;
$horaInicial   = !empty($dados['hora_inicial']) ? "'".$mysqli->real_escape_string($dados['hora_inicial'])."'" : "NULL";
$horaFinal     = !empty($dados['hora_final']) ? "'".$mysqli->real_escape_string($dados['hora_final'])."'" : "NULL";
$avaliacao_1_5 = isset($dados['avaliacao_1_5']) ? intval($dados['avaliacao_1_5']) : 5;
$idUsuario     = isset($dados['idUsuario']) ? intval($dados['idUsuario']) : 0;
$idDiscente    = isset($dados['idDiscente']) ? intval($dados['idDiscente']) : 0;
$idAtividades  = !empty($dados['idAtividades']) ? intval($dados['idAtividades']) : null;

if (!empty($dataBruta) && $idUsuario > 0 && $idDiscente > 0) {
    
    try {
        $dt = DateTime::createFromFormat('d/m/Y', trim($dataBruta));
        if (!$dt) {
            $dt = new DateTime(trim($dataBruta));
        }
        $data = $dt->format('Y-m-d');
    } catch (Exception $e) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Formato de data inválido. Use DD/MM/YYYY."
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $complemento = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
    
    try {
        // 1. Salva na tabela DIARIO (Sem avaliacao_1_5)
        $queryDiario = "INSERT INTO diario (data, hora_inicial, hora_final, complemento, idUsuario, idDiscente) 
                        VALUES ('$data', $horaInicial, $horaFinal, '$complemento', $idUsuario, $idDiscente)";
        
        $mysqli->query($queryDiario);
        $idDiarioCriado = $mysqli->insert_id;

        // 2. Salva na tabela DIARIO_TEM_ATIVIDADES (Com avaliacao_1_5)
        if ($idAtividades !== null) {
            $queryPivo = "INSERT INTO diario_tem_atividades (idDiario, idAtividades, hora_inicial, hora_final, avaliacao_1_5) 
                          VALUES ($idDiarioCriado, $idAtividades, $horaInicial, $horaFinal, $avaliacao_1_5)";
            $mysqli->query($queryPivo);
        }
        
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Diário salvo com sucesso!",
            "idDiario" => $idDiarioCriado
        ], JSON_UNESCAPED_UNICODE);

    } catch (mysqli_sql_exception $e) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro no Banco: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos fornecidos."
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>