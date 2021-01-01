'use strict';
var Tile = require('./tile');

var Tiles = function () {
  var arr = [];
  for (let i = 0; i < 9; i++) {
    arr.push(new Tile('A', 1, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('B', 3, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('C', 3, false));
  }
  for (let i = 0; i < 4; i++) {
    arr.push(new Tile('D', 2, false));
  }
  for (let i = 0; i < 12; i++) {
    arr.push(new Tile('E', 1, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('F', 4, false));
  }
  for (let i = 0; i < 3; i++) {
    arr.push(new Tile('G', 2, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('H', 4, false));
  }
  for (let i = 0; i < 9; i++) {
    arr.push(new Tile('I', 1, false));
  }
  arr.push(new Tile('J', 8, false));
  arr.push(new Tile('K', 5, false));
  for (let i = 0; i < 4; i++) {
    arr.push(new Tile('L', 1, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('M', 3, false));
  }
  for (let i = 0; i < 6; i++) {
    arr.push(new Tile('N', 1, false));
  }
  for (let i = 0; i < 8; i++) {
    arr.push(new Tile('O', 1, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('P', 3, false));
  }
  arr.push(new Tile('Q', 10, false));
  for (let i = 0; i < 6; i++) {
    arr.push(new Tile('R', 1, false));
  }
  for (let i = 0; i < 4; i++) {
    arr.push(new Tile('S', 1, false));
  }
  for (let i = 0; i < 6; i++) {
    arr.push(new Tile('T', 1, false));
  }
  for (let i = 0; i < 4; i++) {
    arr.push(new Tile('U', 1, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('V', 4, false));
  }
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('W', 4, false));
  }
  arr.push(new Tile('X', 8, false));
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile('Y', 4, false));
  }
  arr.push(new Tile('Z', 10, false));
  for (let i = 0; i < 2; i++) {
    arr.push(new Tile(' ', 0, true));
  }
  this.tiles = arr;
};

module.exports = Tiles;
