<?php
    session_start();
    $msg_from=$_SESSION["pid"];

    include("config.php");
    $msg_send=$_POST["msg_send"];
    // Trim() -> ôter espaces superflux.
    $msg_send=trim($msg_send);
    $msg_type=$_POST["msg_type"];

    $dbh = new PDO($dsn,$user,$password_d);
    if($msg_send==""){
           echo "N_OK";
    }else{
        // Récupérer le timestamp au moment de l'envoi du message.
            $req = $dbh->prepare("INSERT INTO msg(msgfrom,msgtext,ts,msgtype) VALUES(?,?,?,?)");
            $req->execute(array($msg_from,$msg_send,time(),$msg_type));
        // juste pour vérifier que c'est ok
            echo "OK";
    }