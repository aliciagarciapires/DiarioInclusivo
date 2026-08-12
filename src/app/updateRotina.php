<?php
// Desativa a exibição de avisos/erros do PHP como HTML para não quebrar o JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Inclui seu arquivo de conexão
include_once "conexao.php"; 

// Identifica a variável de conexão do mysqli
$db = isset($mysqli) ? $mysqli : (isset($conn) ? $conn : null);

if (!$db) {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro: Conexao mysqli nao encontrada."]);
    exit;
}

$json = file_get_contents('php://input');
$dados = json_decode($json, true);

if (!empty($dados['idRotina']) && isset($dados['atividades'])) {
    $idRotina = (int) $dados['idRotina'];
    $nomeRotina = $dados['nomeRotina'];

    // 1. Atualiza o nome na tabela rotina
    $stmt1 = $db->prepare("UPDATE rotina SET nome = ? WHERE idRotina = ?");
    if (!$stmt1) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro SQL 1: " . $db->error]);
        exit;
    }
    $stmt1->bind_param("si", $nomeRotina, $idRotina);
    $stmt1->execute();
    $stmt1->close();

    // 2. Limpa as atividades antigas
    $stmt2 = $db->prepare("DELETE FROM rotina_tem_atividades WHERE idRotina = ?");
    if (!$stmt2) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro SQL 2: " . $db->error]);
        exit;
    }
    $stmt2->bind_param("i", $idRotina);
    $stmt2->execute();
    $stmt2->close();

    // 3. Insere os novos relacionamentos
    $stmt3 = $db->prepare("INSERT INTO rotina_tem_atividades (idRotina, idAtividades, horas_iniciais, horas_finais) VALUES (?, ?, ?, ?)");
    if (!$stmt3) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro SQL 3: " . $db->error]);
        exit;
    }

    foreach ($dados['atividades'] as $ativ) {
        $idAtiv = (int) $ativ['idAtividades'];
        $hIni = $ativ['horaInicial'];
        $hFim = $ativ['horaFinal'];

        $stmt3->bind_param("iiss", $idRotina, $idAtiv, $hIni, $hFim);
        $stmt3->execute();
    }
    $stmt3->close();

    echo json_encode(["sucesso" => true, "mensagem" => "Rotina atualizada com sucesso!"]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos fornecidos."]);
}
?>