<?php
// --- CONFIGURAÇÃO DE TRATAMENTO DE ERROS DO PHP ---
// Oculta a exibição de erros/avisos do PHP na tela para não "sujar" a resposta e quebrar o formato JSON no app
ini_set('display_errors', 0);
// Configura o PHP para registrar/processar todos os tipos de erros internamente
error_reporting(E_ALL);

// --- CONFIGURAÇÃO DE CABEÇALHOS (HEADERS CORS E FORMATO) ---
// Libera o acesso para que aplicativos de qualquer origem (ex: React Native/Expo) façam requisições aqui
header("Access-Control-Allow-Origin: *");
// Define quais cabeçalhos HTTP são permitidos na requisição (neste caso, envio de JSON)
header("Access-Control-Allow-Headers: Content-Type");
// Informa ao cliente/app que a resposta desta API será estritamente um JSON codificado em UTF-8
header("Content-Type: application/json; charset=UTF-8");

// --- IMPORTAÇÃO DO ARQUIVO DE CONEXÃO ---
// Inclui e executa o arquivo de conexão com o banco de dados apenas uma vez
require_once 'conexao.php';

// --- TRATAMENTO/LOCALIZAÇÃO DINÂMICA DA VARIÁVEL DE BANCO ---
// Inicializa a variável $db como nula por padrão
$db = null;

// Verifica qual nome de variável foi utilizado dentro de conexao.php ($conn, $conexao ou $mysqli)
if (isset($conn) && $conn !== null) {
    $db = $conn; // Atribui $conn para $db se ela existir
} elseif (isset($conexao) && $conexao !== null) {
    $db = $conexao; // Atribui $conexao para $db se ela existir
} elseif (isset($mysqli) && $mysqli !== null) {
    $db = $mysqli; // Atribui $mysqli para $db se ela existir
}

// 1. Caso nenhuma das variáveis conhecidas de conexão tenha sido encontrada ou se a conexão falhou
if (!$db || $db->connect_error) {
    // Retorna um array JSON vazio para não quebrar o React Native
    echo json_encode([]);
    // Encerra a execução do código PHP imediatamente
    exit;
}

// --- EXECUÇÃO DA CONSULTA SQL (QUERY) ---
// Define o comando SQL para buscar todas as atividades cadastradas na tabela ATIVIDADES, ordenadas por nome
$sql = "SELECT * FROM atividades ORDER BY nome ASC"; 
// Executa a consulta no banco de dados através do MySQLi e guarda os dados em $result
$result = $db->query($sql);

// Se a consulta SQL falhar (ex: tabela ATIVIDADES não existir ou erro de sintaxe)
if (!$result) {
    // Retorna um array JSON vazio para evitar que o React Native trave
    echo json_encode([]);
    // Interrompe o script
    exit;
}

// Inicializa o array que guardará a lista final de atividades formatadas
$atividades = array();

// Verifica se a consulta retornou pelo menos 1 registro (linha) do banco de dados
if ($result->num_rows > 0) {
    // Percorre cada linha trazida pelo MySQL como um array associativo ($row)
    while ($row = $result->fetch_assoc()) {
        
        // Mapeamento dinâmico do ID: procura a coluna correta ('idAtividades', 'id' ou 'id_atividade')
        // O operador ?? (Null Coalescing) pega o primeiro valor que existir; se nenhum existir, usa 0
        $id = $row['idAtividades'] ?? $row['id'] ?? $row['id_atividade'] ?? 0;
        
        // Mapeamento dinâmico do Nome: procura a coluna de nome da atividade ou define 'Sem nome'
        $nome = $row['nome'] ?? $row['nome_atividade'] ?? 'Sem nome';

        // Adiciona um objeto formatado com as chaves exatas que o React Native espera ('idAtividades' e 'nome')
        $atividades[] = array(
            "idAtividades" => (int)$id, // Força a conversão do ID para número inteiro
            "nome" => $nome             // Armazena o texto com o nome da atividade
        );
    }
}

// --- RESPOSTA FINAL ---
// Devolve a lista pura de atividades em formato JSON (Exemplo: [{"idAtividades": 1, "nome": "Estudar"}])
echo json_encode($atividades);
// Encerra a execução do script com sucesso
exit;
?>