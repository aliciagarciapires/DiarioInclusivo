<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexao.php';

$db = $conn ?? $conexao ?? $mysqli ?? null;

// Recebe os dados JSON enviados pelo React Native
$dados = json_decode(file_get_contents("php://input"), true);

$nome = $dados['nome'] ?? '';
$dataNasc = $dados['dataNasc'] ?? '';
$grau = $dados['grau'] ?? '';
// Recebe a lista de IDs dos responsáveis selecionados
$idsResponsaveis = $dados['idsResponsaveis'] ?? []; 

if (empty($nome) || empty($dataNasc) || empty($grau)) {
    echo json_encode(["success" => false, "message" => "Preencha todos os campos obrigatórios."]);
    exit;
}

try {
    // 1. Cadastra o Discente na tabela discentes
    // (Ajuste os nomes das colunas e da tabela se forem diferentes no seu banco)
    $stmt = $db->prepare("INSERT INTO discente (nome, data_nascimento, grau_de_suporte) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nome, $dataNasc, $grau);
    
    if ($stmt->execute()) {
        // Pega o ID do Discente recém-criado
        $idDiscente = $db->insert_id;

        // 2. Insere os vínculos na tabela usuario_possui_discente
        if (!empty($idsResponsaveis) && is_array($idsResponsaveis)) {
            $stmtRelacao = $db->prepare("INSERT INTO usuario_possui_discente (idUsuario, idDiscente) VALUES (?, ?)");

            foreach ($idsResponsaveis as $idUsuario) {
                $idUsuarioInt = (int)$idUsuario;
                $stmtRelacao->bind_param("ii", $idUsuarioInt, $idDiscente);
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