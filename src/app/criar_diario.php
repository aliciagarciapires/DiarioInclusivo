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

date_default_timezone_set('America/Sao_Paulo');

include_once "conexao.php";

if (!isset($mysqli) || $mysqli->connect_errno) {
    ob_clean();
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Falha na conexão inicial com o Banco de Dados."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

$mysqli->set_charset("utf8mb4");

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

    // 1. Permite vários diários na mesma data, desde que os horários não se sobreponham.
    $complemento = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';

    $horaInicialTexto = !empty($dados['hora_inicial']) ? trim($dados['hora_inicial']) : null;
    $horaFinalTexto = !empty($dados['hora_final']) ? trim($dados['hora_final']) : null;

    if ($horaInicialTexto && $horaFinalTexto) {
        $checkQuery = "SELECT idDiario, hora_inicial, hora_final FROM diario WHERE idDiscente = $idDiscente AND data = '$data'";
        $checkResult = $mysqli->query($checkQuery);

        if ($checkResult) {
            while ($registro = $checkResult->fetch_assoc()) {
                $horaExistenteInicio = $registro['hora_inicial'];
                $horaExistenteFim = $registro['hora_final'];

                if (!$horaExistenteInicio || !$horaExistenteFim) {
                    continue;
                }

                $inicioNovo = strtotime($horaInicialTexto);
                $fimNovo = strtotime($horaFinalTexto);
                $inicioAntigo = strtotime($horaExistenteInicio);
                $fimAntigo = strtotime($horaExistenteFim);

                $sobrepoe = $inicioNovo < $fimAntigo && $fimNovo > $inicioAntigo;

                if ($sobrepoe) {
                    echo json_encode([
                        "sucesso" => false,
                        "mensagem" => "Já existe um diário neste mesmo horário para este discente na data selecionada."
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
            }
        }
    }
    
    try {
        // 2. Salva na tabela DIARIO
        $queryDiario = "INSERT INTO diario (data, hora_inicial, hora_final, complemento, idUsuario, idDiscente) 
                        VALUES ('$data', $horaInicial, $horaFinal, '$complemento', $idUsuario, $idDiscente)";
        
        if (!$mysqli->query($queryDiario)) {
            throw new Exception($mysqli->error);
        }
        
        $idDiarioCriado = $mysqli->insert_id;

        // 3. Salva na tabela DIARIO_TEM_ATIVIDADES
        if ($idAtividades !== null && $idAtividades > 0) {
            $queryPivo = "INSERT INTO diario_tem_atividades (idDiario, idAtividades, hora_inicial, hora_final, avaliacao_1_5) 
                          VALUES ($idDiarioCriado, $idAtividades, $horaInicial, $horaFinal, $avaliacao_1_5)";
            
            if (!$mysqli->query($queryPivo)) {
                throw new Exception($mysqli->error);
            }
        }

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Diário salvo com sucesso!",
            "idDiario" => $idDiarioCriado
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
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