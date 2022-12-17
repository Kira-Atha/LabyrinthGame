<?php
    session_start();
    $tsCurr=$_SESSION["tsCurr"];
    $pid=$_SESSION["pid"];

    include("config.php");

    header('content-Type: text/xml');
    echo '<?xml version="1.0" encoding="UTF-8"?>';

    $dbh = new PDO($dsn,$user,$password_d);
    // Jointure sur l'id du joueur pour retrouver son pseudo et n'afficher que les messages à partir du moment de connexion de l'utilisateur ( stocké dans la session au moment du login)
    $req = $dbh->prepare("SELECT msg.msgfrom,msg.msgtext,msg.ts,msg.msgtype,players.login FROM msg INNER JOIN players ON msg.msgfrom = players.pid WHERE ts>=? ORDER BY ts DESC LIMIT 10");
    echo "<Racine>";
    $req->execute(array($tsCurr));
    while ($res = $req->fetch()) {
        echo "<MsgContent>";
        echo "<Auteur>" . $res["login"] . "</Auteur>";
            // L'utilisateur peut éventuellement introduire des caractères tels que >,< et &.
        echo "<Message>";
        echo "<![CDATA[" . $res["msgtext"] . "]]>";
        echo "</Message>";
        echo "<Ts>" . $res["ts"] . "</Ts>";
        echo "</MsgContent>";
    }
    echo "</Racine>";