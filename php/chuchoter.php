<?php
    session_start();
    $msg_from = $_SESSION["pid"];
    $msg_send = $_POST["msg_send"];
    // Trim() -> ôter espaces superflux.
    $msg_send = trim($msg_send);
    $msg_to=$_POST["msg_to"];
    $msg_type = 0;//doffice car chuchoter

    include("config.php");

    $dbh = new PDO($dsn, $user, $password_d);
    if ($msg_send == "") {
        echo "N_OK";
    } else {
        // Récupérer le timestamp au moment de l'envoi du message.
        $req = $dbh->prepare("INSERT INTO msg(msgfrom,msgtext,ts,msgtype) VALUES(?,?,?,?)");
        $req->execute(array($msg_from, $msg_send, time(), $msg_type));
// Pas fonctionnel : stocke null dans la base de données même lorsque les id sont respectés. .value des options générées par JS pose problème ??
        $req=$dbh->prepare("INSERT INTO msgto(msgto) VALUES(?)");
        $req->execute(array($msg_to));
        // juste pour vérifier que c'est ok
        echo "OK";
    }