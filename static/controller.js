var introDiv = document.getElementById("intro-div");
var gameDiv = document.getElementById("game-div");
var socket = io();

function joinGame() {
    introDiv.setAttribute("hidden", true);
    gameDiv.removeAttribute("hidden");
}

function spawnEnemy(id) {
    var splitId = id.split("");
    
    var enemy = {
        pos: splitId[1]
    };

    switch(splitId[0]) {
        case "L":
            enemy.location = "left";
            break;
        case "T":
            enemy.location = "top";
            break;
        case "R":
            enemy.location = "right";
            break;
        case "B":
            enemy.location = "bottom";
            break;
        default:
            console.log("An error occurred!");
    }

    socket.emit('enemy', enemy);
}