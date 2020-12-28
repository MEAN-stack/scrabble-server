var Tiles = require('../../tiles');
var shuffle = require('lodash.shuffle');
var router = require('express').Router();

var myTiles = shuffle(new Tiles().tiles);

// return a collection of tiles
router.get('/:count', function (req, res, next) {
  tiles = [];
  for (i = 0; i < req.params.count; i++) {
    if (myTiles.length > 0) {
      tiles.push(myTiles.pop());
    }
  }
  res.json(tiles);
});

// return a collection of tiles
router.get('/', function (req, res, next) {
  var tiles = new Tiles().tiles;
  res.json(shuffle(tiles));
});

module.exports = router;
