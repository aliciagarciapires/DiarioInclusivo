<?php
// Oculta erros visíveis na tela para evitar quebrar a resposta JSON com HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Inclui o arquivo de conexão
require_once 'conexao.php';

// Tenta localizar a variável da conexão criada no conexao.php
$db = null;
if (isset($conn) && $conn !== null) {
    $db = $conn;
} elseif (isset($conexao) && $conexao !== null) {
    $db = $conexao;
} elseif (isset($mysqli) && $mysqli !== null) {
    $db = $mysqli;
}

// 1. Caso a variável de conexão não tenha sido encontrada
if (!$db) {
    echo json_encode([
        "erro" => true,
        "mensagem" => "Variável de conexão não encontrada. Verifique o nome da variável no seu conexao.php (ex: \$conn, \$conexao ou \$mysqli)."
    ]);
    exit;
}

// 2. Caso a conexão tenha falhado
if ($db->connect_error) {
    echo json_encode([
        "erro" => true,
        "mensagem" => "Falha na conexão com o banco de dados: " . $db->connect_error
    ]);
    exit;
}

// Query no banco de dados
$sql = "SELECT * FROM usuario WHERE tipo_de_usuario = 1"; 
$result = $db->query($sql);

if (!$result) {
    echo json_encode([
        "erro" => true,
        "mensagem" => "Erro na consulta SQL: " . $db->error
    ]);
    exit;
}

$responsaveis = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Mapeamento dinâmico para pegar o ID e o Nome independente de como estão batizados na tabela
        $id = $row['id'] ?? $row['id_usuario'] ?? $row['idUsuario'] ?? $row['cd_usuario'] ?? 0;
        $nome = $row['nome'] ?? $row['nome_usuaario'] ?? $row['nomeUsuario'] ?? $row['nm_usuario'] ?? 'Sem nome';

        $responsaveis[] = array(
            "id" => (int)$id,
            "nome" => $nome
        );
    }
}

// Retorna a lista de responsáveis limpa em JSON
echo json_encode($responsaveis);
exit;
?>