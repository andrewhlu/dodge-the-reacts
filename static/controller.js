var introDiv = document.getElementById("intro-div");
var gameDiv = document.getElementById("game-div");
var socket = io();

function joinGame() {
    introDiv.setAttribute("hidden", true);
    gameDiv.removeAttribute("hidden")

}