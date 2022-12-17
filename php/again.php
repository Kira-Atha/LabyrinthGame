<?php
    session_start();
    $pid=$_SESSION["pid"];

    include("config.php");

    $dbh = new PDO($dsn,$user,$password_d);

    $req=$dbh->prepare("UPDATE players SET x=?,y=?,z=? WHERE pid=?");
    $req->execute(array(1,1,0,$pid));

    $req=$dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
    $req->execute(array($pid));
    while($res=$req->fetch()) {
        echo $res["x"] . ";" . $res["y"] . ";" . $res["z"];
    }