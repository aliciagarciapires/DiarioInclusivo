<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once "conexao.php";

$db = $mysqli ?? $conn ?? $conexao ?? null;
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$nome = $data['nome'] ?? '';
$dataNasc = $data['dataNasc'] ?? $data['data_nascimento'] ?? '';
$grau = $data['grau'] ?? $data['grau_de_suporte'] ?? '';
$idsResponsaveis = $data['idsResponsaveis'] ?? $data['responsaveis'] ?? [];

if (!empty($id) && !empty($nome) && !empty($dataNasc) && !empty($grau)) {

    try {
        $idDiscenteInt = (int)$id;

        // 1. Atualiza APENAS os dados do discente (mantém o idUsuario original intacto)
        $stmt = $db->prepare("UPDATE discente SET nome = ?, data_nascimento = ?, grau_de_suporte = ? WHERE id = ?");
        $stmt->bind_param("sssi", $nome, $dataNasc, $grau, $idDiscenteInt);
        $stmt->execute();
        $stmt->close();

        // 2. Remove os vínculos antigos de responsáveis
        $stmtDel = $db->prepare("DELETE FROM usuario_possui_discente WHERE idDiscente = ?");
        $stmtDel->bind_param("i", $idDiscenteInt);
        $stmtDel->execute();
        $stmtDel->close();

        // 3. Insere a nova lista de responsáveis (idResp) para esse discente
        if (!empty($idsResponsaveis) && is_array($idsResponsaveis)) {
            $stmtIns = $db->prepare("INSERT INTO usuario_possui_discente (idResp, idDiscente) VALUES (?, ?)");

            foreach ($idsResponsaveis as $idResp) {
                $idRespInt = (int)$idResp;
                $stmtIns->bind_param("ii", $idRespInt, $idDiscenteInt);
                $stmtIns->execute();
            }
            $stmtIns->close();
        }

        echo json_encode(["success" => true, "message" => "Discente e responsáveis atualizados com sucesso!"]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Erro no banco de dados: " . $e->getMessage()]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Dados incompletos recebidos pelo PHP."]);
}

if ($db) {
    $db->close();
}
?>