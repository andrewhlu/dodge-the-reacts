var introDiv = document.getElementById("intro-div");
var introNumSpawnsSpan = document.getElementById("intro-num-spawns");
var introSpawnTimeDiv = document.getElementById("intro-spawn-time");

var gameDiv = document.getElementById("game-div");
var timerSpan = document.getElementById("game-timer");
var livesSpan = document.getElementById("game-lives-timer");
var enemiesSpan = document.getElementById("game-enemies-left");

var socket = io();

var spawnsRemaining = 2;
var spawnTimeout = 2; // in seconds

function init() {
    introNumSpawnsSpan.innerHTML = spawnsRemaining;
    introSpawnTimeDiv.innerHTML = spawnTimeout;
    enemiesSpan.innerHTML = spawnsRemaining;
}

function joinGame() {
    introDiv.setAttribute("hidden", true);
    gameDiv.removeAttribute("hidden");
}

function spawnEnemy(id) {
    if(spawnsRemaining > 0) {
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

        spawnsRemaining--;
        enemiesSpan.innerHTML = spawnsRemaining;

        socket.emit('enemy', enemy);

        setTimeout(() => {
            spawnsRemaining++;
            enemiesSpan.innerHTML = spawnsRemaining;
        }, spawnTimeout * 1000);
    }
    else {
        console.log("No spawns remaining!");
    }   
}

window.onload = () => {
    init();
};