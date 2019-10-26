const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const asnyc = require('async');
const fs = require('fs');
const pg = require('pg');

app.use('/static', express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });

// io.emit('some event', { for: 'everyone' });


// Database configuration
var config = {
  user: "gridiron",
  host: "gcp-us-west1.gridiron-gauntlet.crdb.io",
  database: 'defaultdb',
  port: 26257
  // sslmode: "require",
  // ssl: {}
};

// Setting up the database
var pool = new pg.Pool(config);

pool.connect((error, client, done) => {
  
});




// This is a blocking function, keep this at the end!
http.listen(3000, function(){
  console.log('listening on *:3000');
});