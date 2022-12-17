<?php
    $login=$_POST["login"];
    $password=$_POST["password"];
    $email=$_POST["email"];

    include("config.php");

    $dbh = new PDO($dsn,$user,$password_d);
    $req=$dbh->prepare("SELECT login,email FROM players WHERE login=?");
    $req->execute(array($login));
    // D'abord vérifier que le login introduit existe pas déjà.
    if($res=$req->fetch()) {
        $login_recup_bdd = $res["login"];
        // L'utilisateur existe déjà.
        if($login_recup_bdd == $login){
            echo "N_OK";
        }
    }else{
        // S'il n'existe pas, hasher le password et stocker dans la BDD.
        $hash_password = password_hash($password, PASSWORD_DEFAULT);
    // Positionner le joueur à 1,1,0 par défaut.
        $req = $dbh->prepare("INSERT INTO players(login,passwd,email,x,y,z) VALUES(?,?,?,?,?,?)");
        $req->execute(array($login,$hash_password,$email,1,1,0));
        echo "OK";
    }