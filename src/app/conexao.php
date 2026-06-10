<?php
    $hostname = "localhost";
    $bancodedados = "diarioinclusivo";
    $usuario = "root";
    $senha = "";

    $mysqli = new mysqli($hostname, $usuario, $senha, $bancodedados);
    if ($mysqli->connect_errno) {
        // Se falhar, não imprima texto. Retorne um erro JSON ou apenas pare.
        exit(); 
    }
?>