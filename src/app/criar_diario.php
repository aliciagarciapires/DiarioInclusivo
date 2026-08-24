<?php
// Garante que não haverá espaços/avisos sujando a resposta
ob_start();

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 1. Inclui o banco
include_once "conexao.php";

// Força UTF-8 na conexão MySQL (evita erro no json_encode por acentuação)
if (isset($mysqli)) {
    $mysqli->set_charset("utf8");
}

date_default_timezone_set('America/Sao_Paulo');

// Limpa qualquer aviso impresso pelo conexao.php
ob_clean();

// 2. Lê os dados recebidos
$raw_input = file_get_contents("php://input");
$dados = json_decode($raw_input, true);

// Se não recebeu corpo na requisição
if (!$dados) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Nenhum dado JSON foi recebido pelo servidor."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

$dataBruta = $dados['data'] ?? null;
$idUsuario = isset($dados['idUsuario']) ? intval($dados['idUsuario']) : 0;
$idDiscente = isset($dados['idDiscente']) ? intval($dados['idDiscente']) : 0;

if (!empty($dataBruta) && $idUsuario > 0 && $idDiscente > 0) {
    
    // Tratamento e conversão da data
    try {
        $dt = DateTime::createFromFormat('d/m/Y', trim($dataBruta));
        if (!$dt) {
            $dt = new DateTime(trim($dataBruta));
        }
        $data = $dt->format('Y-m-d');
    } catch (Exception $e) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Formato de data inválido. Use DD/MM/YYYY."
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $complemento = isset($dados['complemento']) ? $mysqli->real_escape_string($dados['complemento']) : '';
    
    $queryDiario = "INSERT INTO diario (data, complemento, idUsuario, idDiscente) 
                    VALUES ('$data', '$complemento', $idUsuario, $idDiscente)";
    
    if ($mysqli->query($queryDiario)) {
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Diário salvo com sucesso!",
            "idDiario" => $mysqli->insert_id
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao salvar no banco MySQL: " . $mysqli->error
        ], JSON_UNESCAPED_UNICODE);
    }
    
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos. Recebido: data=" . var_export($dataBruta, true) . ", idUsuario=" . $idUsuario . ", idDiscente=" . $idDiscente
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>