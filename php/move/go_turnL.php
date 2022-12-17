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
    // En allant vers haut et gauche, il n'est possible d'atteindre que l'extrême nord ET ouest du labyrinthe. Si la case où le joueur souhaite se rendre n'est pas un mur, alors d'autres tests peuvent avoir lieu.
    // Vérifier que la case d'en haut est bien un couloir et pas un mur.
    if ( ($laby[$Z][$X-1][$Y-1]==1 && $laby[$Z][$X-1][$Y]==1) || $X-1<=0 || $Y-1<=0 ) {
        echo "N_OK";
    } else {
        $newX = $X - 1;
        $newY = $Y - 1;

        // Si la case où l'utilisateur s'est rendu est un escalier montant ou descendant, modifier Z en conséquence et mettre à jour dans la base de données la nouvelle position.
        if ($laby[$Z][$newX][$newY] == 4) {
            $newZ = $Z + 1;
            $infoMoveJS = "Z+1";

            $req = $dbh->prepare("UPDATE players SET x=?,y=?,z=? WHERE pid=?");
            $req->execute(array(1, 1, $newZ, $pid));
            $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
            $req->execute(array($pid));
            while ($res = $req->fetch()) {
                echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y] . ";" . $infoMoveJS;
            }
        } elseif ($laby[$Z][$newX][$newY] == 3) {
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
            // N'accepter qu'un mouvement supplémentaire à gauche.
        } elseif ($laby[$Z][$newX][$newY] == 2) {
            if ($laby[$Z][$newX][$newY] != 1) {
                $newY -= 1;
                $infoMoveJS = "pos+2";

                $req = $dbh->prepare("UPDATE players SET x=?,y=? WHERE pid=?");
                $req->execute(array($newX,$newY, $pid));
                $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
                $req->execute(array($pid));
                while ($res = $req->fetch()) {
                    echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y] . ";" . $infoMoveJS;
                }
            }
            // Si la case est un 0 ( couloir ) se suffir d'un déplacement et stocker nouvelle position BDD.
        } else {
            $req = $dbh->prepare("UPDATE players SET x=?,y=? WHERE pid=?");
            $req->execute(array($newX,$newY, $pid));
            $req = $dbh->prepare("SELECT x,y,z FROM players WHERE pid=?");
            $req->execute(array($pid));
            while ($res = $req->fetch()) {
                echo $res["x"] . ";" . $res["y"] . ";" . $res["z"] . ";" . $laby[$Z][$X][$Y];
            }
        }
    }