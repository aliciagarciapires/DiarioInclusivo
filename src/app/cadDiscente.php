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
    // 1. Cadastra o Discente na tabela
    $stmt = $db->prepare("INSERT INTO discente (nome, data_nascimento, grau_de_suporte) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nome, $dataNasc, $grau);
    
    if ($stmt->execute()) {
        $idDiscente = $db->insert_id;

        // 2. Salva a relação com idUsuario (quem cadastrou) e idResp (responsável selecionado)
        if (!empty($idsResponsaveis) && is_array($idsResponsaveis)) {
            $stmtRelacao = $db->prepare("INSERT INTO usuario_possui_discente (idUsuario, idResp, idDiscente) VALUES (?, ?, ?)");
            $idUsuarioInt = (int)$idUsuarioLogado;

            foreach ($idsResponsaveis as $idResp) {
                $idRespInt = (int)$idResp;
                $stmtRelacao->bind_param("iii", $idUsuarioInt, $idRespInt, $idDiscente);
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