/* **********************
*   VARIABLES GLOBALES *
************************/
// Récupère le theme par défaut ( blue dans les options ) => Nécessiterait une attente entre la récupération du thème et l'affichage du terrain de jeu afin de laisser le temps aux images de se charger.
var theme = recup_theme();

var canvas;
var context;
var pos;
var posX;
var posY;
var posZ;
var xhr=new XMLHttpRequest();
    /* **************************
     * Tableau stock image murs *
     ***************************/
// Il y a 25 positions de mur possible et 5 types de mur.
var tab_wall=new Array(25);
for(var i=0;i<25;i++){
    tab_wall[i]=new Array(6);
}
tab_wall.fill(0);
    /* **************************************************************************************
    * Tableau des positions possibles des murs visibles à partir du point de vue ( PS * QS )*
    *****************************************************************************************/
var tab_pos=[
    "AS","BS","CS","ES","FS","GS",
    "BF","CF","DF","EF","FF",
    "HS","IS","KS","LS",
    "IF","JF","KF",
    "MS","OS",
    "MF","NF","OF",
    "PS","QS"
];
/* **********
* FONCTIONS *
************/
    /* ****************
    * FONCTIONS ÉCRAN *
    *******************/
function disp_register(){
    $("identifiant_log").value="";
    $("password_log").value="";
    show("register");
    hide("login");
}
function cancel_register(){
    $("identifiant_reg").value="";
    $("password_reg").value="";
    $("mail_reg").value="";
    $("error").innerHTML = "";
    $("error_mail").innerHTML = "";
    $("error_psw").innerHTML = "";
    show("login");
    hide("register");
}
function logout(){
    show("login");
    hide("game");
    hide("chat");
    $("error").innerHTML="Vous avez bien été déconnecté.";
    $("chat_send").value="";
}
    // Recommencer au point de départ 1;1;0
function again() {
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            pos = xhr.responseText;
            pos = pos.split(';');
            posX = pos[0];
            posY = pos[1];
            posZ = pos[2];
            $("pos").innerHTML = "Vous vous êtes assoupi.<br> À votre réveil, vous réalisez que vous êtes revenu au point de départ.<br>" + "X => " + posX + " Y => " + posY + " Z => " + posZ;
            $("compass").src="./imgs/iu/compass-N.png";
        }
    };
    xhr.open("POST","php/again.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(null);
}
    /* ****************
    * FONCTIONS LOGIN *
    *******************/
        // Affiche l'écran de jeu et le chat lorsque la personne est connectée.
function login(){
    var login = $("identifiant_log").value;
    var password=$("password_log").value;

    xhr=new XMLHttpRequest();
    var param = "login=" + encodeURIComponent(login);
    param=param+"&password="+encodeURIComponent(password);

    xhr.onreadystatechange=function() {
        if (xhr.readyState == 4 && xhr.status==200) {
            login=xhr.responseText;
            login=login.split(';');

           if(login[0] ==="OK") {
               init_game();
               $("identifiant_log").value = "";
               $("password_log").value = "";
               $("identifiant_reg").value = "";
               $("password_reg").value = "";
               $("mail_reg").value = "";
               $("error").innerHTML = "";
               show("game");
               show("chat");
               $("logout").innerHTML=login[1]+" => Déconnexion";
               hide("login");
           }else if(xhr.responseText ==="N_OK") {
               $("identifiant_log").value = "";
               $("password_log").value = "";
               $("error").innerHTML = "Votre mot de passe est incorrect. ";
           }else if(xhr.responseText ==="N_OK2"){
                $("identifiant_log").value="";
                $("password_log").value="";
                $("error").innerHTML="Votre nom de compte n'existe pas, veuillez vous inscrire. ";
            }
        }
    };
    xhr.open("POST", "php/login.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(param);
}
    /* *************************
    * FONCTIONS D'INSCRIPTION *
    ***************************/
        // Compare les valeurs introduites par l'utilisateur dans les champs pseudo, mot de passe et e-mail à chaque lever de touches. Si les trois regexp sont respectées, donner la possibilité de s'inscrire ( afficher bouton )
function test_reg_register() {
    if (new RegExp(/^[a-zA-Z]{5,16}$/).test($("identifiant_reg").value)) {
        $("identifiant_reg").style.borderColor = "green";
        $("error").innerHTML = "";
    } else {
        $("identifiant_reg").style.borderColor = "red";
        $("error").innerHTML = "Le login doit contenir de 5 à 16 lettres et ne peut contenir ni chiffre, ni symbole spécial, ni espace.";
    }
    if (new RegExp(/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,16}$/).test($("password_reg").value)) {
        $("password_reg").style.borderColor = "green";
        $("error_psw").innerHTML = "";
    } else {
        $("password_reg").style.borderColor = "red";
        $("error_psw").innerHTML = "Le mot de passe doit contenir de 8 à 16 caractères dont au moins, une minuscule, une majuscule et un chiffre et ne peut contenir ni symbole spécial, ni espace";
    }
    if (new RegExp(/^\S+@\S+\.\S+$/).test($("mail_reg").value)) {
        $("mail_reg").style.borderColor = "green";
        $("error_mail").innerHTML = "";
    } else {
        $("mail_reg").style.borderColor = "red";
        $("error_mail").innerHTML = "L'e-mail doit respecter le format standard et peut contenir des lettres ou des chiffres. Exemple : ab23c@def.ijk.";
    }
    new RegExp(/^[a-zA-Z]{5,16}$/).test($("identifiant_reg").value) && new RegExp(/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,16}$/).test($("password_reg").value) && new RegExp(/^\S+@\S+\.\S+$/).test($("mail_reg").value) ? $("button_reg_test").style.visibility = "visible" : $("button_reg_test").style.visibility = "hidden"
}
        // Envoie les valeurs des champs pseudo, mot de passe et e-mail lorsque l'utilisateur clique sur s'inscrire (-> register.php )
function test_bdd_register() {
    show("login");
    hide("register");

    var login=$("identifiant_reg").value;
    var password=$("password_reg").value;
    var email=$("mail_reg").value;

    var param = "login=" + encodeURIComponent(login);
    param=param+"&password="+encodeURIComponent(password);
    param=param+"&email="+encodeURIComponent(email);

    xhr.onreadystatechange=function() {
        if (xhr.readyState == 4 && xhr.status==200) {
           if( (xhr.responseText) ==="OK"){
               $("identifiant_reg").value="";
               $("password_reg").value="";
               $("mail_reg").value="";
               show("login");
               hide("register");
               $("error").innerHTML="Votre compte a bien été créé, veuillez vous connecter.";
           }
           if( (xhr.responseText) ==="N_OK"){
               $("identifiant_reg").value="";
               $("password_reg").value="";
               $("mail_reg").value="";
               $("error").innerHTML="Cet identifiant existe déjà.";
           }
        }
    };
    xhr.open("POST", "php/register.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(param);
}
    /* *************************
    * FONCTIONS DE DÉPLACEMENT *
    ****************************/
function go_right(){
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            if(xhr.responseText==="N_OK"){
                $("pos").innerHTML="Impossible d'emprunter ce chemin. Un mur obstrue le passage.";
            }else {
                pos = xhr.responseText;
                pos = pos.split(';');
                posX = pos[0];
                posY = pos[1];
                posZ = pos[2];
                typeMur=pos[3];
                $("pos").innerHTML = "Vous parvenez à vous déplacer.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                $("compass").src="./imgs/iu/compass-E.png";
                if(pos[4]==="pos+2"){
                    $("pos").innerHTML = "Vous venez de pousser une porte et vous vous êtes avancé un peu plus.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z+1"){
                    $("pos").innerHTML = "Vous grimpez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z-1"){
                    $("pos").innerHTML = "Vous descendez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }
                // Modifier affichage mur ici
            }
        }
    };
    xhr.open("POST","php/move/go_right.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(null);
}
function go_left(){
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            if(xhr.responseText==="N_OK"){
                $("pos").innerHTML="Impossible d'emprunter ce chemin. Un mur obstrue le passage.";
            }else {
                pos = xhr.responseText;
                pos = pos.split(';');
                posX = pos[0];
                posY = pos[1];
                posZ = pos[2];
                typeMur=pos[3];
                $("pos").innerHTML = "Vous parvenez à vous déplacer.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                $("compass").src="./imgs/iu/compass-W.png";
                if(pos[4]==="pos+2"){
                    $("pos").innerHTML = "Vous venez de pousser une porte et vous vous êtes avancé un peu plus.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z+1"){
                    $("pos").innerHTML = "Vous grimpez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z-1"){
                    $("pos").innerHTML = "Vous descendez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }
                // Modifier affichage mur ici
            }
        }
    };
    xhr.open("POST","php/move/go_left.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(null);
}
function go_up(){
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            if(xhr.responseText==="N_OK"){
                $("pos").innerHTML="Impossible d'emprunter ce chemin. Un mur obstrue le passage.";
            }else {
                pos = xhr.responseText;
                pos = pos.split(';');
                posX = pos[0];
                posY = pos[1];
                posZ = pos[2];
                typeMur=pos[3];
                $("pos").innerHTML = "Vous parvenez à vous déplacer.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                $("compass").src="./imgs/iu/compass-N.png";
                if(pos[4]==="pos+2"){
                    $("pos").innerHTML = "Vous venez de pousser une porte et vous vous êtes avancé un peu plus.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z+1"){
                    $("pos").innerHTML = "Vous grimpez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z-1"){
                    $("pos").innerHTML = "Vous descendez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }
                // Modifier affichage mur ici
            }
        }
    };
    xhr.open("POST","php/move/go_up.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(null);
}
function go_down(){
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            if(xhr.responseText==="N_OK"){
                $("pos").innerHTML="Impossible d'emprunter ce chemin. Un mur obstrue le passage.";
            }else {
                pos = xhr.responseText;
                pos = pos.split(';');
                posX = pos[0];
                posY = pos[1];
                posZ = pos[2];
                typeMur=pos[3];
                $("pos").innerHTML = "Vous parvenez à vous déplacer.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                $("compass").src="./imgs/iu/compass-S.png";
                if(pos[4]==="pos+2"){
                    $("pos").innerHTML = "Vous venez de pousser une porte et vous vous êtes avancé un peu plus.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z+1"){
                    $("pos").innerHTML = "Vous grimpez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z-1"){
                    $("pos").innerHTML = "Vous descendez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }
                // Modifier affichage mur ici
            }
        }
    };
    xhr.open("POST","php/move/go_down.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(null);
}
function go_turnR(){
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            if(xhr.responseText==="N_OK"){
                $("pos").innerHTML="Impossible d'emprunter ce chemin. Un mur obstrue le passage.";
            }else {
                pos = xhr.responseText;
                pos = pos.split(';');
                posX = pos[0];
                posY = pos[1];
                posZ = pos[2];
                typeMur=pos[3];
                $("pos").innerHTML = "Vous parvenez à vous déplacer.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                $("compass").src="./imgs/iu/compass-E.png";
                if(pos[4]==="pos+2"){
                    $("pos").innerHTML = "Vous venez de pousser une porte et vous vous êtes avancé un peu plus.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z+1"){
                    $("pos").innerHTML = "Vous grimpez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z-1"){
                    $("pos").innerHTML = "Vous descendez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }
                // Modifier affichage mur ici
            }
        }
    };
    xhr.open("POST","php/move/go_turnR.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(null);
}
function go_turnL(){
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            if(xhr.responseText==="N_OK"){
                $("pos").innerHTML="Impossible d'emprunter ce chemin. Un mur obstrue le passage.";
            }else {
                pos = xhr.responseText;
                pos = pos.split(';');
                posX = pos[0];
                posY = pos[1];
                posZ = pos[2];
                typeMur=pos[3];
                $("pos").innerHTML = "Vous parvenez à vous déplacer.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                $("compass").src="./imgs/iu/compass-W.png";
                if(pos[4]==="pos+2"){
                    $("pos").innerHTML = "Vous venez de pousser une porte et vous vous êtes avancé un peu plus.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z+1"){
                    $("pos").innerHTML = "Vous grimpez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }else if(pos[4]==="Z-1"){
                    $("pos").innerHTML = "Vous descendez les marches d'un escalier.<br>"+"X => " + posX + " Y => " + posY + " Z => " + posZ;
                }
                // Modifier affichage mur ici
            }
        }
    };
    xhr.open("POST","php/move/go_turnL.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(null);
}
    /* ***************
    * FONCTIONS CHAT *
    ******************/
// Stocker dans la BDD le message envoyé.
function send_msg(){
    var msg_send=$("chat_send").value;
    var msg_type=$("typeMsg").value;

    if(msg_type==0){
        var msg_to=$("ch").value;

        var param = "msg_send=" + encodeURIComponent(msg_send);
        param =param + "&msg_to" + encodeURIComponent(msg_to);

        xhr.open("POST", "php/chuchoter.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(param);
    }else {
        var param = "msg_send=" + encodeURIComponent(msg_send);
        param = param + "&msg_type=" + encodeURIComponent(msg_type);

        xhr.open("POST", "php/chat_bdd.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(param);
    }
}
function chatSelect(){
    console.log("hello");
    var msg_type=$("typeMsg").value;

    if(msg_type==0){
        var chat = $("chat");
        utilisateursOnline = ["test0","test1","test2","test3"];/* Faudrait une réponse xml qui retourne les joueurs et leur id;*/

        var chuchoter = document.createElement('select');
        chuchoter.setAttribute("id", "ch");
        while (utilisateursOnline.length) {
            var utilOnline = utilisateursOnline.pop();
            var opt = new Option(utilOnline);
            opt.value=utilisateursOnline;
            chuchoter.options[chuchoter.options.length] = opt;
        }
        chat.appendChild(chuchoter);
    }else{
        // Si la div ch a été créée(existe),retirer ce qu'il contient
        if($("ch")) {
            $("ch").parentNode.removeChild($("ch"));
        }
    }
}
// Récupérer les messages qui sont stockés dans la bdd et les ajouter au tableau XML
// Mettre un timer pour que les messages soient récupérés à des moments fixes.
function init_msg(){
    $("p_msg_send").innerHTML="";

    xhr.onreadystatechange=function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            message=xhr.responseXML.getElementsByTagName("MsgContent");

            for(i=message.length-1;i>=0;i--){
                auteur=message[i].getElementsByTagName("Auteur")[0].firstChild.nodeValue;
                messageTxt=message[i].getElementsByTagName("Message")[0].firstChild.nodeValue;
                ts=message[i].getElementsByTagName("Ts")[0].firstChild.nodeValue;
                disp_msg(auteur,messageTxt,ts);
            }
        }
    };
    xhr.open("GET","php/chat_disp_bdd.php",true);
    xhr.send(null);
    // Aura tout de même lieu si le joueur est déconnecté ...
    setTimeout(init_msg, 3000);
}
function disp_msg(aut,msg,ts){
    div_msg=document.createElement("div");
    div_chat=document.createElement("div");
    div_chat.className="msg_send";
    date = new Date(ts*1000);

    div_msg.innerHTML = "[" + date.getHours() + ":" + date.getMinutes() + "] " + "<em>" + aut + "</em>" + " => <strong> \" " + msg + " \"</strong> ";

    div_chat.appendChild(div_msg);
    $("p_msg_send").appendChild(div_chat);
}
function msg_upperCase() {
    $("chat_send").value = $("chat_send").value.toUpperCase();
}
    /* ***************************
    * FONCTIONS D'INITIALISATION *
    ******************************/
        // Avant d'afficher les images, il faut absolument les charger.
function recup_theme(){
    theme=$("theme").value;

    return theme;
}
function init_bg(theme){
    canvas = $("lab");
    context=canvas.getContext("2d");
    bg = new Image();
    bg.src = "./imgs/lab/" + theme + ".BACK.png";
}
function init_wall(theme){
    for(i=0;i<25;i++){
        for(j=0;j<6;j++){
            wall_load=new Image();
            wall_load.src="./imgs/lab/"+theme+"."+tab_pos[i]+j+".png";

            /* tab_wall[0][0] contiendrait l'image theme.AS0
             tab_wall[0][1] contiendrait l'image theme.AS1
             ...
             tab_wall[24][4] contiendrait l'image theme.QS5
             */
        }
    }
}
function draw(){
    context.drawImage(bg,0,0,640,400);
}
 //Laisser le temps de charger et afficher.
function init_game(){
    init_msg();
    init_bg(theme);
    init_wall(theme);
}
// Non fonctionnel : L'idée était d'attendre la fin de chargement des images lorsque l'utilisateur se connecte et afficher le fond d'écran.
// Ce qui se passe : Tente d'afficher au PREMIER écran (avant même de se loguer ) mais le thème n'est chargé que par la suite, il ne se passe donc rien.
window.addEventListener("DOMContentLoaded", (event) => {
    draw();
});