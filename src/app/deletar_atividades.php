<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);
$idRotina = filter_var($dados['idRotina'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$idAtividade = filter_var($dados['idAtividades'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$inicio = $dados['horas_iniciais'] ?? null;
$fim = $dados['horas_finais'] ?? null;
$formatoHora = '/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/D';

if (!$idRotina || !$idAtividade || !is_string($inicio) || !is_string($fim)
    || !preg_match($formatoHora, $inicio) || !preg_match($formatoHora, $fim)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Informe a rotina, a atividade e os horários inicial e final válidos.']);
    exit;
}

// Aceita tanto HH:mm quanto HH:mm:ss.
$inicio = strlen($inicio) === 5 ? $inicio . ':00' : $inicio;
$fim = strlen($fim) === 5 ? $fim . ':00' : $fim;

try {
    include_once "conexao.php";

    // Remove somente esta ocorrência, preservando o cadastro e os outros horários.
    $stmt = $mysqli->prepare(
        "DELETE FROM rotina_tem_atividades
         WHERE idRotina = ? AND idAtividades = ? AND horas_iniciais = ? AND horas_finais = ?
         LIMIT 1"
    );
    if (!$stmt) {
        throw new RuntimeException($mysqli->error);
    }
    $stmt->bind_param('iiss', $idRotina, $idAtividade, $inicio, $fim);
    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $removida = $stmt->affected_rows > 0;
    $stmt->close();
    echo json_encode([
        'sucesso' => $removida,
        'mensagem' => $removida ? 'Atividade removida da rotina!' : 'Atividade não encontrada na rotina e nos horários informados.'
    ]);
} catch (Throwable $erro) {
    error_log('Erro em deletar_atividades.php: ' . $erro->getMessage());
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao remover a atividade da rotina.']);
}
