<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Desativa exibição de erros do PHP na resposta para evitar sujar o JSON
ini_set('display_errors', 0);
error_reporting(0);

include_once "conexao.php";

if (ob_get_length()) ob_clean(); // Limpa o buffer de saída para evitar que qualquer saída anterior interfira no JSON

// Garante que se $mysqli falhar, devolve um JSON válido
if (!isset($mysqli) || $mysqli->connect_error) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro de conexão com o banco de dados."
    ]);
    exit;
}

$idUsuario = isset($_GET['idUsuario']) ? intval($_GET['idUsuario']) : 1; //isset verifica se a variável existe, caso não exista, atribui o valor 1 como padrão. intval converte o valor para inteiro, garantindo que seja seguro para uso na consulta SQL.

// Busca todas as rotinas do usuário
$query = "SELECT r.idRotina, r.nome AS nomeRotina, 
                 rta.idAtividades, a.nome AS nomeAtividade, 
                 rta.horas_iniciais, rta.horas_finais
          FROM rotina r
          LEFT JOIN rotina_tem_atividades rta ON r.idRotina = rta.idRotina
          LEFT JOIN atividades a ON rta.idAtividades = a.idAtividades 
          WHERE r.idUsuario = $idUsuario
          ORDER BY r.idRotina DESC";

$result = $mysqli->query($query); //a variavel $result recebe o resultado da consulta SQL, que é um objeto mysqli_result contendo todas as linhas retornadas pela consulta.

$rotinasAux = [];

if ($result) {
    while ($row = $result->fetch_assoc())  //fetch_assoc() cria um array associativo para cada linha do resultado
    //onde os nomes das colunas são as chaves do array.
    {
        $idR = $row['idRotina'];
        
        if (!isset($rotinasAux[$idR])) //esse "!" inverte no caso de existir, ou seja, se não existir,
        // ele cria um array com o id da rotina, o nome da rotina e um array vazio para as atividades.
             {
            // Cria uma nova entrada para a rotina se ainda não existir
            $rotinasAux[$idR] = [
                'idRotina' => (int)$idR,
                'nome' => $row['nomeRotina'],
                'atividades' => []
            ];
        }
        // Adiciona a atividade à rotina correspondente, se existir
        if (!empty($row['idAtividades'])) 

            {
            // Adiciona a atividade à rotina correspondente
            $rotinasAux[$idR]['atividades'][] = [
                'id' => (int)$row['idAtividades'],
                'nome' => $row['nomeAtividade'],
                'inicio' => $row['horas_iniciais'],
                'fim' => $row['horas_finais']
            ];
        }
    }
    // Retorna o resultado como JSON e envia para o front
    echo json_encode([
        "sucesso" => true,
        "dados" => array_values($rotinasAux) //array_values orgaiza numericamente o array para que seja retornado como uma lista
    ]);
} else {
    // Em caso de erro na consulta, retorna um JSON com a mensagem de erro
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro na consulta: " . $mysqli->error
    ]);
}
?>
