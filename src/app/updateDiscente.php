<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Trata a requisição PREFLIGHT do navegador/Mobile
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once "conexao.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id']) && !empty($data['nome']) && !empty($data['data_nascimento']) && !empty($data['grau_de_suporte'])) {
    
    // Prepara a query MySQLi com Prepared Statements
    $stmt = $mysqli->prepare("UPDATE discente SET nome = ?, data_nascimento = ?, grau_de_suporte = ? WHERE id = ?");

    if ($stmt) {
        // "sssi" -> string, string, string/int, integer
        $stmt->bind_param("sssi", $data['nome'], $data['data_nascimento'], $data['grau_de_suporte'], $data['id']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Discente atualizado com sucesso!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro ao executar atualização: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Erro no prepare da SQL: " . $mysqli->error]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Dados incompletos recebidos pelo PHP."]);
}

$mysqli->close();
?>