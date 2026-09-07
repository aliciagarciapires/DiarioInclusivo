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

$idDiario      = isset($dados['idDiario']) ? intval($dados['idDiario']) : 0;
$atividade     = isset($dados['atividade']) ? trim($dados['atividade']) : '';
$complemento   = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
$avaliacao     = isset($dados['avaliacao_1_5']) && $dados['avaliacao_1_5'] !== '' ? intval($dados['avaliacao_1_5']) : null;
$dataBruta     = $dados['data'] ?? null;

if ($idDiario > 0 && !empty($atividade)) {
    
    // Formata a data se ela vier preenchida (aceita DD/MM/AAAA ou YYYY-MM-DD)
    $dataSql = null;
    if (!empty($dataBruta)) {
        try {
            $dt = DateTime::createFromFormat('Y-m-d', trim($dataBruta));
            if (!$dt) {
                $dt = DateTime::createFromFormat('d/m/Y', trim($dataBruta));
            }
            if (!$dt) {
                $dt = new DateTime(trim($dataBruta));
            }
            $dataSql = $dt->format('Y-m-d');
        } catch (Exception $e) {
            $dataSql = null;
        }
    }

    try {
        // 1. Atualiza os dados principais na tabela 'diario'
        if ($dataSql) {
            $queryDiario = "UPDATE diario SET complemento = '$complemento', data = '$dataSql' WHERE idDiario = $idDiario";
        } else {
            $queryDiario = "UPDATE diario SET complemento = '$complemento' WHERE idDiario = $idDiario";
        }
        $mysqli->query($queryDiario);

        // 2. Descobre se a atividade enviada é um número (ID) ou texto (Nome)
        $idAtividadeFinal = 0;
        if (is_numeric($atividade)) {
            $idAtividadeFinal = intval($atividade);
        } else {
            $stmtAtiv = $mysqli->prepare("SELECT idAtividades FROM atividades WHERE nome = ? LIMIT 1");
            $stmtAtiv->bind_param("s", $atividade);
            $stmtAtiv->execute();
            $resAtiv = $stmtAtiv->get_result();
            if ($rowAtiv = $resAtiv->fetch_assoc()) {
                $idAtividadeFinal = intval($rowAtiv['idAtividades']);
            }
            $stmtAtiv->close();
        }

        // 3. Atualiza ou insere na tabela 'diario_tem_atividades' incluindo a avaliação
        if ($idAtividadeFinal > 0) {
            $check = $mysqli->query("SELECT idDiario FROM diario_tem_atividades WHERE idDiario = $idDiario LIMIT 1");
            
            $sqlAvaliacao = ($avaliacao !== null) ? $avaliacao : "NULL";

            if ($check && $check->num_rows > 0) {
                $mysqli->query("UPDATE diario_tem_atividades SET idAtividades = $idAtividadeFinal, avaliacao_1_5 = $sqlAvaliacao WHERE idDiario = $idDiario");
            } else {
                $mysqli->query("INSERT INTO diario_tem_atividades (idDiario, idAtividades, avaliacao_1_5) VALUES ($idDiario, $idAtividadeFinal, $sqlAvaliacao)");
            }
        }

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Registro atualizado com sucesso!"
        ], JSON_UNESCAPED_UNICODE);

    } catch (mysqli_sql_exception $e) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro no Banco de Dados: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }

} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos. ID do diário e atividade são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>