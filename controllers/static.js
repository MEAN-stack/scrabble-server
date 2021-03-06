'use strict';
var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res) {
  res.sendfile(path.resolve(__dirname + '/../scrabble/index.html'));
});

router.use(express.static(__dirname + '/../scrabble'));

router.get('*', function (req, res, next) {
  res.sendfile(path.resolve(__dirname + '/../scrabble/index.html'));
});

module.exports = router;
