<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include 'conexao.php';

$db = $mysqli ?? $conn ?? $conexao ?? null;
$id = $_GET['id'] ?? null;

if (!$id || !$db) {
    echo json_encode(["success" => false, "message" => "ID não fornecido ou erro na conexão."]);
    exit;
}

try {
    // 1. Busca os dados do discente
    $stmt = $db->prepare("SELECT id, nome, data_nascimento, grau_de_suporte FROM discente WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resDiscente = $stmt->get_result();
    $discente = $resDiscente->fetch_assoc();

    if (!$discente) {
        echo json_encode(["success" => false, "message" => "Discente não encontrado."]);
        exit;
    }

    // 2. Busca os nomes dos responsáveis usando a coluna 'idUsuario' no JOIN
    $stmtResp = $db->prepare("
        SELECT u.nome 
        FROM usuario_possui_discente upd 
        JOIN usuario u ON upd.idResp = u.idUsuario
        WHERE upd.idDiscente = ?
    ");
    
    $nomesResponsaveis = [];
    if ($stmtResp) {
        $stmtResp->bind_param("i", $id);
        $stmtResp->execute();
        $resResp = $stmtResp->get_result();
        while ($row = $resResp->fetch_assoc()) {
            $nomesResponsaveis[] = $row['nome'];
        }
    }

    // Formata os nomes dos responsáveis
    $discente['nomes_responsaveis'] = !empty($nomesResponsaveis) 
        ? implode(", ", $nomesResponsaveis) 
        : "Nenhum responsável vinculado";

    echo json_encode(["success" => true, "dados" => $discente]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Erro no banco de dados: " . $e->getMessage()]);
}
?>