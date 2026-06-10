<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
include('conexao.php');

$input = file_get_contents("php://input");
$dados = json_decode($input, true);

$email = $dados['email'] ?? '';
$senha = $dados['senha'] ?? '';

if (empty($email) || empty($senha)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Preencha todos os campos."]);
    exit();
}

$stmt = $mysqli->prepare("SELECT idUsuario, senha FROM usuario WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $usuario = $resultado->fetch_assoc();
    
    // Comparação direta (Texto puro)
    if ($senha === $usuario['senha']) {
        echo json_encode([
            "sucesso" => true, 
            "mensagem" => "Login realizado com sucesso!",
            "userId" => $usuario['idUsuario']
        ]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Senha incorreta."]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "E-mail não encontrado."]);
}

$stmt->close();
$mysqli->close();
?>