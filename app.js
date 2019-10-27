const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const asnyc = require('async');
const fs = require('fs');

const {Client, Query} = require('pg');

var status = {
  status: "start",
  time: 0,
  lives: 3
};

var timerTimeout;

// Database configuration
var config = {
  user: "gridiron",
  password: process.env.CRDB_PWD,
  host: "gcp-us-west1.gridiron-gauntlet.crdb.io",
  database: 'defaultdb',
  port: 26257,
  ssl: {
    ca: fs.readFileSync('gridiron-gauntlet-ca.crt').toString()
  }
};

// Serve static pages (anything in the static directory)
app.use('/static', express.static('static'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Set status function
function setStatus() {
  const setupClient = new Client(config);
  setupClient.connect();
  setupClient.query('insert into status values ($1, $2, $3);', [status.status, status.time, status.lives], (error, res) => {
    if(error) {
      console.log(error);
    }
  });
}

// Listen for controller enemy spawns
io.on('connection', function(socket) {
  const enemySpawnClient = new Client(config);
  enemySpawnClient.connect();

  socket.on('enemy', function(msg){
    // console.log(msg, client);
    enemySpawnClient.query('insert into enemies values ($1, $2);', [msg.location, msg.pos], (error, res) => {
      if(error) {
        console.log(error);
      }
    });
  });
});

// Event controller enemy spawns to VR users using CockroachDB CDC
const cdcClient = new Client(config);
cdcClient.connect();
cdcClient.query('select cluster_logical_timestamp() as now;', (err, row) => {
  if(err) {
    console.log(err);
  }
  else {
    const now = row.rows[0].now;
    const query = cdcClient.query(new Query('CREATE CHANGEFEED FOR TABLE enemies WITH CURSOR=\'' + now + '\''));
    query.on('row', (row) => {
      const val = JSON.parse(row.value).after;
      console.log(val);

      io.emit('generate-new-enemy', val);
    })
  }
});

// Listen for successful enemy hits
io.on('connection', function(socket) {
  socket.on('user-hit', function(msg){
    if(msg) {
      console.log("The user was hit!");
      
      status.lives--;

      if(status.lives <= 0) {
        status.lives = 0;
        status.status = "enemy-win";
      }

      clearTimeout(timerTimeout);

      setStatus();
    }
  });
});

// Event status to all users using CockroachDB CDC
const statusClient = new Client(config);
statusClient.connect();
statusClient.query('select cluster_logical_timestamp() as now;', (err, row) => {
  if(err) {
    console.log(err);
  }
  else {
    const now = row.rows[0].now;
    const query = statusClient.query(new Query('CREATE CHANGEFEED FOR TABLE status WITH CURSOR=\'' + now + '\''));
    query.on('row', (row) => {
      const val = JSON.parse(row.value).after;
      console.log(val);
      status = val;

      io.emit('status-update', val);
    });
  }
});

// Listen for start event
io.on('connection', (socket) => {
  socket.on('game-start', (msg) => {
    if(msg) {
      console.log("Game is starting!");

      var date = new Date();
      
      status.status = "in-progress";
      status.time = date.getTime() + 60000;
      status.lives = 3;

      setStatus();

      timerTimeout = setTimeout(() => {
        status.status = "vr-win";
        setStatus();
      }, 60000);
    }
  });
});

setStatus();

// Finally, open server on port and listen for connections.
// This is a blocking function, keep this at the end!
http.listen(3000, function() {
  console.log('listening on *:3000');
});

// truncate table enemies

// select count(*) from enemies where location in ('right', 'left')

// create table enemies(
// pos int check pos values in (0, 1, 2, 3, 4),
// location string check location values in ('top', 'right', 'left', 'bottom')
// )
