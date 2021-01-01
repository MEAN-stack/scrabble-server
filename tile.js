'use strict';
var Tile = function (letter, value, isBlank) {
  this.letter = letter;
  this.value = value;
  this.isBlank = isBlank;
};

module.exports = Tile;
