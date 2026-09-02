<?php
ob_start();

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

ob_clean();

$idDiscente = isset($_GET['idDiscente']) ? intval($_GET['idDiscente']) : 0;

if ($idDiscente > 0) {
    try {
        $query = "SELECT d.idDiario, 
                         DATE_FORMAT(d.data, '%d/%m/%Y') AS data, 
                         d.hora_inicial, 
                         d.hora_final, 
                         d.complemento, 
                         da.idAtividades, 
                         da.avaliacao_1_5,
                         a.nome AS atividade
                  FROM diario d
                  LEFT JOIN diario_tem_atividades da ON d.idDiario = da.idDiario
                  LEFT JOIN atividades a ON da.idAtividades = a.idAtividades
                  WHERE d.idDiscente = $idDiscente 
                  ORDER BY d.data DESC, d.idDiario DESC";

        $resultado = $mysqli->query($query);
        $diarios = [];

        while ($linha = $resultado->fetch_assoc()) {
            $diarios[] = $linha;
        }

        echo json_encode([
            "sucesso" => true,
            "dados" => $diarios
        ], JSON_UNESCAPED_UNICODE);

    } catch (mysqli_sql_exception $e) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao buscar registros: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "ID do discente não informado."
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>