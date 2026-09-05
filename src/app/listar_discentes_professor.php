<?php
ob_start();

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8"); 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include_once "conexao.php";

$db = $conn ?? $conexao ?? $mysqli ?? null;

if ($db && method_exists($db, "set_charset")) {
    $db->set_charset("utf8mb4");
}

ob_clean();

$idUsuario = isset($_GET['idUsuario']) ? intval($_GET['idUsuario']) : 0;

if ($idUsuario > 0) {
    try {
        // CORRIGIDO: Usando 'id' em vez de 'idDiscente'
        $query = "SELECT id AS id, nome 
                  FROM discente 
                  WHERE idUsuario = $idUsuario";

        $resultado = $db->query($query);
        $discentes = [];

        if ($resultado) {
            while ($linha = $resultado->fetch_assoc()) {
                $discentes[] = $linha;
            }
        }

        echo json_encode([
            "sucesso" => true,
            "dados" => $discentes
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao buscar discentes: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "ID do professor não informado."
    ], JSON_UNESCAPED_UNICODE);
}
exit();
?>