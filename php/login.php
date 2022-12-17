<?php
    session_start();
    $login=$_POST["login"];
    $password=$_POST["password"];

    include("config.php");

    $dbh = new PDO($dsn,$user,$password_d);
    $req=$dbh->prepare("SELECT login,passwd,pid FROM players WHERE login=?");
    $req->execute(array($login));

    if($res=$req->fetch()) {
        $password_recup_bdd = $res["passwd"];
        // L'utilisateur existe et son mot de passe est correct. Stocker le TS de connexion du joueur dans la session.
        if(password_verify($password,$password_recup_bdd)){
            echo "OK".";".$login;
            $_SESSION["pid"]=$res["pid"];
            $_SESSION["tsCurr"]=time();
        }else{
            // L'utilisateur existe mais son mot de passe n'est pas correct.
            echo "N_OK";
        }
    }else{
        // La requête ne donne rien => L'utilisateur n'existe pas.
        echo "N_OK2";
    }