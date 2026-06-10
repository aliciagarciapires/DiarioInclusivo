<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'conexao.php';

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);

if ($dados) {
    $nome = $dados['nome'] ?? '';
    $dataNasc = $dados['dataNasc'] ?? ''; // Ajustado para o nome que você envia no App
    $grau = (int)($dados['grau'] ?? 0);   // Já recebe o número (1, 2 ou 3) diretamente

    // Tratamento da data (caso ela venha como dd/mm/yyyy)
    if (strpos($dataNasc, '/') !== false) {
        $dateObj = DateTime::createFromFormat('d/m/Y', $dataNasc);
        if ($dateObj) {
            $dataNasc = $dateObj->format('Y-m-d');
        }
    }

    // Preparação única e execução direta
    $stmt = $mysqli->prepare("INSERT INTO discente (nome, data_nascimento, grau_de_suporte) VALUES (?, ?, ?)");
    
    if ($stmt) {
        // "ssi" = string, string, inteiro
        $stmt->bind_param("ssi", $nome, $dataNasc, $grau);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true, 
                "message" => "Discente cadastrado com sucesso!",
                "idUsuario" => $stmt->insert_id 
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro ao executar: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Erro na preparação: " . $mysqli->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Dados vazios ou formato inválido"]);
}
?>