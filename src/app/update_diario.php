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
$complemento   = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
$dataBruta     = $dados['data'] ?? null;
$atividades    = isset($dados['atividades']) && is_array($dados['atividades']) ? $dados['atividades'] : [];

if ($idDiario > 0 && !empty($dataBruta) && !empty($atividades)) {
    
    // Formata a data (aceita DD/MM/AAAA ou YYYY-MM-DD)
    $dataSql = null;
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
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Formato de data inválido."
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Pega o nome da primeira atividade ou concatena todas para satisfazer a coluna legada 'atividade' caso ela seja obrigatória na tabela diario
    $nomesAtividades = [];
    foreach ($atividades as $ativItem) {
        if (!empty($ativItem['nome'])) {
            $nomesAtividades[] = trim($ativItem['nome']);
        }
    }
    $stringAtividadePrincipal = !empty($nomesAtividades) ? $mysqli->real_escape_string(implode(" + ", $nomesAtividades)) : '';

    $mysqli->begin_transaction();

    try {
        // 1. Atualiza os dados principais na tabela 'diario' (incluindo a coluna 'atividade' para evitar o erro de 'doesn't have a default value')
        $queryDiario = "UPDATE diario 
                        SET complemento = '$complemento', 
                            data = '$dataSql', 
                            atividade = '$stringAtividadePrincipal' 
                        WHERE idDiario = $idDiario";
        
        $mysqli->query($queryDiario);

        // 2. Remove os vínculos antigos para gravar a nova lista atualizada (evita duplicidade)
        $mysqli->query("DELETE FROM diario_tem_atividades WHERE idDiario = $idDiario");

        // 3. Insere os registros atualizados na tabela pivot 'diario_tem_atividades' (seguindo a mesma lógica do seu script de criação)
        foreach ($atividades as $ativ) {
            $idAtividades = isset($ativ['idAtividades']) ? intval($ativ['idAtividades']) : 0;
            
            // Se por acaso vier só o nome e não o ID, tenta buscar o ID correspondente na tabela atividades
            if ($idAtividades <= 0 && !empty($ativ['nome'])) {
                $nomeBusca = trim($ativ['nome']);
                $stmtAtiv = $mysqli->prepare("SELECT idAtividades FROM atividades WHERE nome = ? LIMIT 1");
                $stmtAtiv->bind_param("s", $nomeBusca);
                $stmtAtiv->execute();
                $resAtiv = $stmtAtiv->get_result();
                if ($rowAtiv = $resAtiv->fetch_assoc()) {
                    $idAtividades = intval($rowAtiv['idAtividades']);
                }
                $stmtAtiv->close();
            }

            if ($idAtividades > 0) {
                $horaInicial = !empty($ativ['hora_inicial']) ? "'".$mysqli->real_escape_string($ativ['hora_inicial'])."'" : "NULL";
                $horaFinal   = !empty($ativ['hora_final']) ? "'".$mysqli->real_escape_string($ativ['hora_final'])."'" : "NULL";
                
                // Trata a avaliação aceitando tanto avaliacao_1_5 quanto avaliacao
                $avaliacao = 5;
                if (isset($ativ['avaliacao_1_5']) && $ativ['avaliacao_1_5'] !== '') {
                    $avaliacao = intval($ativ['avaliacao_1_5']);
                } elseif (isset($ativ['avaliacao']) && $ativ['avaliacao'] !== '') {
                    $avaliacao = intval($ativ['avaliacao']);
                }

                $queryPivo = "INSERT INTO diario_tem_atividades (idDiario, idAtividades, hora_inicial, hora_final, avaliacao_1_5) 
                              VALUES ($idDiario, $idAtividades, $horaInicial, $horaFinal, $avaliacao)";
                $mysqli->query($queryPivo);
            }
        }

        $mysqli->commit();

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Registro atualizado com sucesso!"
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
        "mensagem" => "Dados incompletos. ID do diário, data e atividades são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>