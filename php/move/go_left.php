<?php

    session_start();
    $pid = $_SESSION["pid"];

    include("../config.php");
    include("../../laby.inc");

    // Récupérer x,y,z afin de pouvoir faire les prochains tests de collision.
    $dbh = new PDO($dsn, $user, $password_d);
    $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
    $req->execute(array($pid));
    if ($res = $req->fetch()) {
        $Y = $res["y"];
        $X = $res["x"];
        $Z = $res["z"];
    }
    // En allant vers la gauche, il n'est possible d'atteindre que l'extrême ouest du labyrinthe. Si la case où le joueur souhaite se rendre n'est pas un mur, alors d'autres tests peuvent avoir lieu.
    if ($laby[$Z][$X][$Y-1] == 1 || $Y - 1 <= 0) {
        echo "N_OK";
    } else {
        $newY = $Y - 1;
    // Si la case où l'utilisateur s'est rendu est un escalier montant ou descendant, modifier Z en conséquence et mettre à jour dans la base de données la nouvelle position.
        if ($laby[$Z][$X][$newY] == 4) {
            $newZ = $Z + 1;
            $infoMoveJS = "Z+1";

            $req = $dbh->prepare("UPDATE players SET x=?,y=?,z=? WHERE pid=?");
            $req->execute(array(1, 1, $newZ, $pid));
            $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
            $req->execute(array($pid));
            while ($res = $req->fetch()) {
                echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y] . ";" . $infoMoveJS;
            }
        } elseif ($laby[$Z][$X][$newY] == 3) {
            $newZ = $Z - 1;
            $infoMoveJS = "Z-1";

            $req = $dbh->prepare("UPDATE players SET x=?,y=?,z=? WHERE pid=?");
            $req->execute(array(1, 1, $newZ, $pid));
            $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
            $req->execute(array($pid));
            while ($res = $req->fetch()) {
                echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y] . ";" . $infoMoveJS;
            }
    // Si la case courante de l'utilisateur est un passage(porte), alors il avance de 1. S'il y a un mur derrière, n'avance pas plus.
        } elseif ($laby[$Z][$X][$newY] == 2) {
            if ($laby[$Z][$X][$newY] != 1) {
                $newY -= 1;
                $infoMoveJS = "pos+2";

                $req = $dbh->prepare("UPDATE players SET y=? WHERE pid=?");
                $req->execute(array($newY, $pid));
                $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
                $req->execute(array($pid));
                while ($res = $req->fetch()) {
                    echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y] . ";" . $infoMoveJS;
                }
            }
    // Si la case est un 0 ( couloir ) se suffir d'un déplacement et stocker nouvelle position BDD.
        } else {
            $req = $dbh->prepare("UPDATE players SET y=? WHERE pid=?");
            $req->execute(array($newY, $pid));
            $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
            $req->execute(array($pid));
            while ($res = $req->fetch()) {
                echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y];
            }
        }
    }