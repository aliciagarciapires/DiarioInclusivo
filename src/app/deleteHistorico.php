<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once "conexao.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(204);
	exit();
}

$dados = json_decode(file_get_contents("php://input"), true);
$idDiario = isset($dados['idDiario']) ? intval($dados['idDiario']) : 0;

if ($idDiario <= 0) {
	echo json_encode([
		"sucesso" => false,
		"mensagem" => "ID do diário não informado."
	]);
	exit();
}

$mysqli->begin_transaction();

try {
	$stmtVinculo = $mysqli->prepare("DELETE FROM diario_tem_atividades WHERE idDiario = ?");
	$stmtVinculo->bind_param("i", $idDiario);
	$stmtVinculo->execute();
	$stmtVinculo->close();

	$stmtDiario = $mysqli->prepare("DELETE FROM diario WHERE idDiario = ?");
	$stmtDiario->bind_param("i", $idDiario);
	$stmtDiario->execute();

	if ($stmtDiario->affected_rows === 0) {
		$stmtDiario->close();
		throw new Exception("Registro do diário não encontrado.");
	}

	$stmtDiario->close();
	$mysqli->commit();

	echo json_encode([
		"sucesso" => true,
		"mensagem" => "Registro excluído com sucesso."
	]);
} catch (Throwable $e) {
	$mysqli->rollback();
	http_response_code(500);
	echo json_encode([
		"sucesso" => false,
		"mensagem" => "Erro ao excluir registro: " . $e->getMessage()
	]);
}
?>
