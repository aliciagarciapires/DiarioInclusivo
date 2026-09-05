<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexao.php';

$db = $conn ?? $conexao ?? $mysqli ?? null;

if (!$db) {
    echo json_encode(["success" => false, "message" => "Erro de conexão com o banco."]);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

$nome = $dados['nome'] ?? '';
$dataNasc = $dados['dataNasc'] ?? '';
$grau = $dados['grau'] ?? '';
$idUsuarioLogado = $dados['idUsuarioLogado'] ?? null;
$idsResponsaveis = $dados['idsResponsaveis'] ?? []; 

if (empty($nome) || empty($dataNasc) || empty($grau) || empty($idUsuarioLogado)) {
    echo json_encode(["success" => false, "message" => "Preencha todos os campos obrigatórios."]);
    exit;
}

try {
    $idUsuarioInt = (int)$idUsuarioLogado;

    // 1. Cadastra o Discente salvando o idUsuario diretamente na tabela discente (chave id é AUTO_INCREMENT)
    $stmt = $db->prepare("INSERT INTO discente (nome, data_nascimento, grau_de_suporte, idUsuario) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $nome, $dataNasc, $grau, $idUsuarioInt);
    
    if ($stmt->execute()) {
        $idDiscente = $db->insert_id;

        // 2. Salva a relação dos responsáveis com o discente usando IGNORE para não duplicar chaves (idResp, idDiscente)
        if (!empty($idsResponsaveis) && is_array($idsResponsaveis)) {
            $stmtRelacao = $db->prepare("INSERT IGNORE INTO usuario_possui_discente (idResp, idDiscente) VALUES (?, ?)");

            foreach ($idsResponsaveis as $idResp) {
                $idRespInt = (int)$idResp;
                $stmtRelacao->bind_param("ii", $idRespInt, $idDiscente);
                $stmtRelacao->execute();
            }
            $stmtRelacao->close();
        }

        echo json_encode([
            "success" => true, 
            "message" => "Discente e vínculos cadastrados com sucesso!",
            "idDiscente" => $idDiscente
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao cadastrar discente: " . $stmt->error]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
?>