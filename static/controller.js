var introDiv = document.getElementById("intro-div");
var introNumSpawnsSpan = document.getElementById("intro-num-spawns");
var introSpawnTimeDiv = document.getElementById("intro-spawn-time");

var gameDiv = document.getElementById("game-div");
var timerSpan = document.getElementById("game-timer");
var livesSpan = document.getElementById("game-lives-counter");
var enemiesSpan = document.getElementById("game-enemies-left");

var socket = io();

var spawnsRemaining = 2;
var spawnTimeout = 2; // in seconds

var timeGameEnd = 0;

function init() {
    introNumSpawnsSpan.innerHTML = spawnsRemaining;
    introSpawnTimeDiv.innerHTML = spawnTimeout;
    enemiesSpan.innerHTML = spawnsRemaining;

    setInterval(() => {
        var date = new Date();
        var timeLeft = timeGameEnd - date.getTime();
        timerSpan.innerHTML = (timeLeft > 0) ? Math.floor(timeLeft / 1000) : 0;
    }, 1000);
}

function joinGame(newGame) {
    introDiv.setAttribute("hidden", true);
    gameDiv.removeAttribute("hidden");

    socket.emit('game-start', newGame);
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

socket.on('status-update', (msg) => {
    console.log(msg);
    livesSpan.innerHTML = msg.lives;
    timeGameEnd = msg.time;

    if(msg.status == "start") {
        introDiv.removeAttribute("hidden");
        gameDiv.setAttribute("hidden", true);
    }
    else {
        introDiv.setAttribute("hidden", true);
        gameDiv.removeAttribute("hidden");
    }
});