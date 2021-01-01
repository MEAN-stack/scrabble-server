'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var websockets = require('./websockets');

var app = express();
app.use(bodyParser.json());
app.use(require('./controllers'));

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log('Set server listening on port ', port);
});

websockets.connect(server);
