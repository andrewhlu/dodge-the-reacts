const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const asnyc = require('async');
const fs = require('fs');

var {Client, Query} = require('pg');

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

app.use('/static', express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  const client = new Client(config);
  client.connect();

  socket.on('enemy', function(msg){
    // console.log(msg, client);
    client.query('insert into enemies values ($1, $2);', [msg.location, msg.pos], (error, res) => {
      console.log("Inserted");
    });
  });
});

const cdcClient = new Client(config);
cdcClient.connect();
cdcClient.query('select cluster_logical_timestamp() as now;', (err, row) => {
  const now = row.rows[0].now;
  const query = cdcClient.query(new Query('CREATE CHANGEFEED FOR TABLE enemies WITH CURSOR=\'' + now + '\''));
  query.on('row', (row) => {
    const val = JSON.parse(row.value).after;
    console.log(val);

    io.emit('generate-new-enemy', val);
  })
});

// truncate table enemies

// select count(*) from enemies where location in ('right', 'left')

// create table enemies(
// pos int check pos values in (0, 1, 2, 3, 4),
// location string check location values in ('top', 'right', 'left', 'bottom')
// )

// This is a blocking function, keep this at the end!
http.listen(3000, function(){
  console.log('listening on *:3000');
});