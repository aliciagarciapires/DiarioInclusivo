<?php
    $hostname = "localhost";
    $bancodedados = "diarioinclusivo";
    $usuario = "root";
    $senha = "";

    $mysqli = new mysqli($hostname, $usuario, $senha, $bancodedados);
    if ($mysqli->connect_errno) {
        die("Falha na conexão: (" . $mysqli->connect_errno . ") " . $mysqli->connect_errno);
    }else {
        echo "Conexão bem-sucedida!";
    }
?>