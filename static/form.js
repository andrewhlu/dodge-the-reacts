var form = document.getElementById("spawnEnemyForm");
var socket = io();

form.onsubmit = function() {
    event.preventDefault();
    submit();
};

function submit() {
    var data = {
        location: document.getElementById('locationSelect').value,
        pos: document.getElementById('indexSelect').value
    }

    socket.emit('enemy', data);
}