'use strict';
var ws = require('ws');
var _ = require('lodash');

/*
  Store an array of client connections here
*/
var clients = [];

/*
  Start a WebSocket server and listen for connections
  server is our HTTP server
*/
exports.connect = function (server) {
  var wss = new ws.Server({ server: server });
  wss.on('connection', function (ws) {
    var client = { game: 0, ws: ws };
    console.log('adding client');
    clients.push(client);
    exports.broadcast('new client joined');

    // keep the connection alive
    var timerId = setInterval(function () {
      ws.send(JSON.stringify(new Date()));
    }, 10000);

    ws.on('close', function () {
      clearInterval(timerId);
      console.log('removing client');
      _.remove(clients, client);
    });
  });
};

/*
  Broadcast a message to all connected clients
  Each message has a title and a data payload
*/
exports.broadcast = function (title, data) {
  console.log('broadcast');
  var json = JSON.stringify({ title: title, data: data });
  clients.forEach(function (client) {
    console.log('sending ' + json + ' to client');
    client.ws.send(json);
  });
};

/*
  Broadcast a message to all players of the given game
  Each message has a title and a data payload
*/
exports.broadcastToPlayers = function (gameId, title, data) {
  var json = JSON.stringify({ title: title, data: data });
  clients.forEach(function (client) {
    if (client.game == gameId) {
      client.ws.send(json);
    }
  });
};
