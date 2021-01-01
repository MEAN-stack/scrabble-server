'use strict';
/*
  This is the browser's entry point
  The browser must request /client?user=p4w&password=recycle
  All being well we return the initial html page
*/
var router = require('express').Router();
var path = require('path');

router.get('*', function (req, res, next) {
  res.sendfile(path.resolve(__dirname + '/../scrabble/index.html'));
});

module.exports = router;
