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

set_time_limit(5);
date_default_timezone_set('America/Sao_Paulo');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

include_once "conexao.php";

if (isset($mysqli)) {
    $mysqli->set_charset("utf8");
}

ob_clean();

$dados = json_decode(file_get_contents("php://input"), true);

$dataBruta     = $dados['data'] ?? null;
$idUsuario     = isset($dados['idUsuario']) ? intval($dados['idUsuario']) : 0;
$idDiscente    = isset($dados['idDiscente']) ? intval($dados['idDiscente']) : 0;
$complemento   = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
$atividades    = isset($dados['atividades']) && is_array($dados['atividades']) ? $dados['atividades'] : [];

if (!empty($dataBruta) && $idUsuario > 0 && $idDiscente > 0 && !empty($atividades)) {
    
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

    $mysqli->begin_transaction();

    try {
        // 1. Cria 1 registro na tabela DIARIO
        $queryDiario = "INSERT INTO diario (data, complemento, idUsuario, idDiscente) 
                        VALUES ('$data', '$complemento', $idUsuario, $idDiscente)";
        
        $mysqli->query($queryDiario);
        $idDiarioCriado = $mysqli->insert_id;

        // 2. Insere N registros na tabela DIARIO_TEM_ATIVIDADES
        foreach ($atividades as $ativ) {
            $idAtividades = intval($ativ['idAtividades']);
            $horaInicial  = !empty($ativ['hora_inicial']) ? "'".$mysqli->real_escape_string($ativ['hora_inicial'])."'" : "NULL";
            $horaFinal    = !empty($ativ['hora_final']) ? "'".$mysqli->real_escape_string($ativ['hora_final'])."'" : "NULL";
            $avaliacao    = isset($ativ['avaliacao_1_5']) ? intval($ativ['avaliacao_1_5']) : 5;

            $queryPivo = "INSERT INTO diario_tem_atividades (idDiario, idAtividades, hora_inicial, hora_final, avaliacao_1_5) 
                          VALUES ($idDiarioCriado, $idAtividades, $horaInicial, $horaFinal, $avaliacao)";
            $mysqli->query($queryPivo);
        }

        $mysqli->commit();
        
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Rotina sincronizada no Diário com sucesso!",
            "idDiario" => $idDiarioCriado
        ], JSON_UNESCAPED_UNICODE);

    } catch (mysqli_sql_exception $e) {
        $mysqli->rollback();
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro no Banco de Dados: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos. Forneça data, usuário, discente e ao menos uma atividade."
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>