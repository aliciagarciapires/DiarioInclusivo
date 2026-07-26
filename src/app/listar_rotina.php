<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once "conexao.php";

if (ob_get_length()) ob_clean();

$idUsuario = isset($_GET['idUsuario']) ? intval($_GET['idUsuario']) : 1;

// Busca todas as rotinas do usuário
$query = "SELECT r.idRotina, r.nome AS nomeRotina, 
                 rta.idAtividades, a.nome AS nomeAtividade, 
                 rta.horas_iniciais, rta.horas_finais
          FROM ROTINA r
          LEFT JOIN ROTINA_TEM_ATIVIDADES rta ON r.idRotina = rta.idRotina
          LEFT JOIN ATIVIDADES a ON rta.idAtividades = a.idAtividades
          WHERE r.idUsuario = $idUsuario
          ORDER BY r.idRotina DESC";

$result = $mysqli->query($query);

$rotinasAux = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $idR = $row['idRotina'];
        
        if (!isset($rotinasAux[$idR])) {
            $rotinasAux[$idR] = [
                'idRotina' => (int)$idR,
                'nome' => $row['nomeRotina'],
                'atividades' => []
            ];
        }
        
        if (!empty($row['idAtividades'])) {
            $rotinasAux[$idR]['atividades'][] = [
                'id' => (int)$row['idAtividades'],
                'nome' => $row['nomeAtividade'],
                'inicio' => $row['horas_iniciais'],
                'fim' => $row['horas_finais']
            ];
        }
    }
    
    echo json_encode([
        "sucesso" => true,
        "dados" => array_values($rotinasAux)
    ]);
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro na consulta: " . $mysqli->error
    ]);
}
?>