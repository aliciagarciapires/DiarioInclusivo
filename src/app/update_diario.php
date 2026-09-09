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
$atividades    = isset($dados['atividades']) && is_array($dados['atividades']) ? $dados['atividades'] : [];

if ($idDiario > 0 && (!empty($atividade) || !empty($atividades))) {
    
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

        // 3. Ajusta a relação do diário com as atividades selecionadas.
        // Em 'diario_tem_atividades' a chave primária é composta por (idDiario, idAtividades),
        // então remove todos os links antigos do diário antes de gravar a versão atualizada,
        // evitando o erro 'duplicate entry'.
        $mysqli->query("DELETE FROM diario_tem_atividades WHERE idDiario = $idDiario");

        if (!empty($atividades)) {
            foreach ($atividades as $item) {
                $nomeAtividade = isset($item['nome']) ? trim((string)$item['nome']) : '';
                $avaliacaoAtividade = isset($item['avaliacao_1_5']) && $item['avaliacao_1_5'] !== '' ? intval($item['avaliacao_1_5']) : (isset($item['avaliacao']) && $item['avaliacao'] !== '' ? intval($item['avaliacao']) : 5);

                $idAtividadeFinal = 0;
                if (isset($item['idAtividades']) && $item['idAtividades'] !== '' && $item['idAtividades'] !== null) {
                    $idAtividadeFinal = intval($item['idAtividades']);
                } elseif (!empty($nomeAtividade)) {
                    $stmtAtiv = $mysqli->prepare("SELECT idAtividades FROM atividades WHERE nome = ? LIMIT 1");
                    $stmtAtiv->bind_param("s", $nomeAtividade);
                    $stmtAtiv->execute();
                    $resAtiv = $stmtAtiv->get_result();
                    if ($rowAtiv = $resAtiv->fetch_assoc()) {
                        $idAtividadeFinal = intval($rowAtiv['idAtividades']);
                    }
                    $stmtAtiv->close();
                }

                if ($idAtividadeFinal > 0) {
                    $mysqli->query("INSERT INTO diario_tem_atividades (idDiario, idAtividades, avaliacao_1_5)
                                    VALUES ($idDiario, $idAtividadeFinal, $avaliacaoAtividade)");
                }
            }
        } elseif ($idAtividadeFinal > 0) {
            $sqlAvaliacao = ($avaliacao !== null) ? $avaliacao : "NULL";
            $mysqli->query("INSERT INTO diario_tem_atividades (idDiario, idAtividades, avaliacao_1_5)
                            VALUES ($idDiario, $idAtividadeFinal, $sqlAvaliacao)");
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