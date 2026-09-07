<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once "conexao.php";

if (isset($mysqli)) {
    $mysqli->set_charset("utf8");
}

// Consulta ajustada com base nas suas imagens:
// - Pega os dados principais da tabela 'diario' (d)
// - Cruza com 'diario_tem_atividades' (ta) para pegar a avaliação e o idAtividades
// - Cruza com 'atividades' (a) para comparar o idAtividades e pegar o 'nome'
$query = "SELECT d.idDiario, d.data, d.complemento, ta.avaliacao_1_5, 
                 COALESCE(a.nome, 'Atividade não vinculada') AS atividade
          FROM diario d
          LEFT JOIN diario_tem_atividades ta ON d.idDiario = ta.idDiario
          LEFT JOIN atividades a ON ta.idAtividades = a.idAtividades
          ORDER BY d.idDiario DESC";

$resultado = $mysqli->query($query);

$historico = [];

if ($resultado) {
    while ($row = $resultado->fetch_assoc()) {
        $historico[] = [
            "idDiario" => intval($row['idDiario']),
            "data" => strval($row['data'] ?? ""),
            "complemento" => strval($row['complemento'] ?? ""),
            "avaliacao_1_5" => isset($row['avaliacao_1_5']) ? intval($row['avaliacao_1_5']) : null,
            "atividade" => strval($row['atividade'])
        ];
    }

    echo json_encode($historico, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}
exit();
?>