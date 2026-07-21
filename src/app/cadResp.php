<?php
// 1. Configurações de cabeçalho e CORS para o React Native
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Trata requisições pre-flight do React Native
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Exibição de erros (útil para desenvolvimento)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 3. Inclui a conexão com o banco de dados
require_once('conexao.php');

// 4. Recebe e decodifica o JSON vindo do corpo da requisição (Fetch do React Native)
$input = file_get_contents("php://input");
$dados = json_decode($input, true);

// Se não enviou nada ou o JSON veio inválido
if (!$dados) {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Nenhum dado recebido pelo servidor."
    ]);
    exit();
}

// 5. Captura as variáveis do JSON
$nome           = trim($dados['nome'] ?? '');
$email          = trim($dados['email'] ?? '');
$telefone       = trim($dados['telefone'] ?? '');
$senha          = $dados['senha'] ?? '';
$confirmarSenha = $dados['confirmarSenha'] ?? '';
// 1. Garante que $tipoConta nunca seja null (se não vier no JSON, assume 1)
$tipoConta = isset($dados['tipoConta']) && !empty($dados['tipoConta']) ? (int)$dados['tipoConta'] : 1;

// 2. Query com o nome correto da coluna
$sql = "INSERT INTO usuario (nome, email, telefone, senha, tipo_de_usuario) VALUES (?, ?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Erro na estrutura da Query SQL: " . $mysqli->error
    ]);
    exit();
}

// 3. Garanta que a variável $tipoConta é o último parâmetro
$stmt->bind_param("ssssi", $nome, $email, $telefone, $senha, $tipoConta);

if ($stmt->execute()) {
    $idInserido = $mysqli->insert_id;
    echo json_encode([
        "sucesso" => true, 
        "mensagem" => "Cadastro realizado com sucesso!",
        "id" => $idInserido
    ]);
} else {
    echo json_encode([
        "sucesso" => false, 
        "mensagem" => "Erro no banco: " . $stmt->error
    ]);
}


// Fecha o statement e a conexão
$stmt->close();
$mysqli->close();
?>