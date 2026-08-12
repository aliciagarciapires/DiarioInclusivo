<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Inclui seu arquivo de conexão que usa mysqli (ex: $mysqli = new mysqli(...))
include_once "conexao.php"; 

// Ajuste aqui caso o nome da sua variável no conexao.php seja $conexao ou outro
$db = isset($mysqli) ? $mysqli : (isset($conn) ? $conn : null);

if (!$db) {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro: Variavel de conexao mysqli nao encontrada."]);
    exit;
}

$json = file_get_contents('php://input');
$dados = json_decode($json, true);

if (!empty($dados['idRotina']) && isset($dados['atividades'])) {
    $idRotina = (int) $dados['idRotina'];
    $nome = $dados['nome'];
    
    // 1. Atualiza o nome da rotina na tabela 'rotina'
    $sql1 = "UPDATE rotina SET nome = ? WHERE idRotina = ?";
    $stmt1 = $db->prepare($sql1);
    
    if (!$stmt1) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no SQL 1: " . $db->error]);
        exit;
    }

    $stmt1->bind_param("si", $nome, $idRotina);
    $stmt1->execute();
    $stmt1->close();

    // 2. Apaga as atividades antigas dessa rotina
    $sql2 = "DELETE FROM rotina_tem_atividades WHERE idRotina = ?";
    $stmt2 = $db->prepare($sql2);

    if (!$stmt2) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no SQL 2: " . $db->error]);
        exit;
    }

    $stmt2->bind_param("i", $idRotina);
    $stmt2->execute();
    $stmt2->close();

    // 3. Insere as novas atividades e horários
    $sql3 = "INSERT INTO rotina_tem_atividades (idRotina, idAtividades, horas_iniciais, horas_finais) VALUES (?, ?, ?, ?)";
    $stmt3 = $db->prepare($sql3);

    if (!$stmt3) {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no SQL 3: " . $db->error]);
        exit;
    }

    // No mysqli, bind_param aceita: i = integer, s = string
    foreach ($dados['atividades'] as $ativ) {
        $idAtiv = (int) $ativ['idAtividades'];
        $hIni = $ativ['horas_iniciais'];
        $hFim = $ativ['horas_finais'];

        $stmt3->bind_param("iiss", $idRotina, $idAtiv, $hIni, $hFim);
        $stmt3->execute();
    }
    $stmt3->close();

    echo json_encode(["sucesso" => true, "mensagem" => "Rotina atualizada com sucesso!"]);

} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados enviados estao incompletos."]);
}
?>