'use strict';
var router = require('express').Router();
var jwt = require('jwt-simple');
var config = require('../../config');
var ws = require('../../websockets');
var Tile = require('../../tile');
var Tiles = require('../../tiles');
var shuffle = require('lodash.shuffle');
var _ = require('lodash');
const isValidWord = require('../../csw19');
const { words } = require('lodash');

var games = [];
var nextId = 1234;
const tileValues = [
  1,
  3,
  3,
  2,
  1,
  4,
  2,
  4,
  1,
  8,
  5,
  1,
  3,
  1,
  1,
  3,
  10,
  1,
  1,
  1,
  1,
  4,
  4,
  8,
  4,
  10,
]; //A..Z

function makeTile(ch) {
  if (ch === ' ') {
    return new Tile(ch, 0, true);
  } else {
    let value = tileValues[ch.charCodeAt(0) - 65];
    return new Tile(ch, value, false);
  }
}

const wordMultiplier = [
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
];

const letterMultiplier = [
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  2,
  1,
  2,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  2,
  1,
  2,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  3,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  1,
  1,
  1,
];

// given the position of any letter, find the whole word on the board, and its starting index
function wordAt(board, index, direction) {
  let stride = 1;
  let testfunc = (i, dir) => {
    return dir < 0 ? i % 15 > 0 : i % 15 < 14;
  };
  if (direction === 'D') {
    stride = 15;
    testfunc = (i, dir) => {
      return true;
    };
  }
  let iStart = index;
  let iEnd = index;
  let word = board[index];
  // find the start of the word
  while (iStart - stride >= 0 && testfunc(iStart, -1)) {
    if (board[iStart - stride] === ' ') {
      break;
    } else {
      word = board[iStart - stride] + word;
      iStart -= stride;
    }
  }
  // find the end of the word
  while (iEnd + stride < 225 && testfunc(iEnd, 1)) {
    if (board[iEnd + stride] === ' ') {
      break;
    } else {
      word = word + board[iEnd + stride];
      iEnd += stride;
    }
  }

  return { word: word, index: iStart, direction: direction };
}

// calculate the score for the word
function wordScore(word, index, direction, playedTileIndices) {
  let stride = 1;
  if (direction === 'D') {
    stride = 15;
  }
  let multiplier = 1;
  let score = 0;
  for (let i = 0; i < word.length; i++) {
    if (playedTileIndices.includes(index)) {
      multiplier *= wordMultiplier[index];
    }
    let ch = word[i];
    if (!isLowerCase(ch)) {
      if (playedTileIndices.includes(index)) {
        score += letterMultiplier[index] * tileValues[ch.charCodeAt(0) - 65];
      } else {
        score += tileValues[ch.charCodeAt(0) - 65];
      }
    }
    index += stride;
  }
  console.log('score for ' + word + ' (' + index + ') = ' + score * multiplier);
  return score * multiplier;
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function getGameForUser(game, username) {
  let players = [];
  for (let i = 0; i < game.players.length; i++) {
    let player = game.players[i];
    if (username === player.user) {
      players.push({
        user: player.user,
        tiles: player.tiles,
        score: player.score,
      });
    } else {
      players.push({ user: player.user, score: player.score });
    }
  }
  let obj = {
    id: game.id,
    owner: game.owner,
    players: players,
    current_player: game.current_player,
    status: game.status,
    num_free_tiles: game.free_tiles.length,
    board: game.board,
  };
  return obj;
}

function playTiles(game, row, col, direction, tiles) {
  console.log('playTiles');
  let score = -1;
  let index = row * 15 + col;
  let stride = 1;
  let numTiles = tiles.length;
  let isNewBoard = false;

  if (direction === 'D') {
    stride = 15;
  }

  const newBoard = ' '.repeat(225);
  if (game.board === newBoard) {
    isNewBoard = true;
    console.log('new board');
    if (direction === 'A') {
      if (index <= 112 - tiles.length || index > 112) {
        console.log('must start in centre');
        return {
          score: -1,
          message: 'first word must cover the centre square',
        };
      }
    } else {
      if (index <= 112 - 15 * tiles.length || index % 15 !== 7 || index > 112) {
        console.log('must start in centre');
        return {
          score: -1,
          message: 'first word must cover the centre square',
        };
      }
    }
  }
  // if the first position is already occupied then fail
  if (game.board[index] !== ' ') {
    console.log('must start in empty square');
    return { score: -1, message: 'word must start in an empty square' };
  }
  let origBoard = game.board;

  // try to place each tile

  let lastTileIndex = -1;
  let words = [];
  let playedTileIndices = [];
  for (let i = 0; i < numTiles; i++) {
    // step to the next unoccupied board position
    console.log('index: ' + index + ' (' + game.board[index] + ')');
    while (index < 225 && game.board[index] !== ' ') {
      index += stride;
    }
    // if we didn't fall off the board then play the tile
    if (index < 225) {
      playedTileIndices.push(index);
      console.log('placing ' + tiles[i] + ' at position ' + index);
      game.board = setCharAt(game.board, index, tiles[i]);
      if (direction === 'D') {
        // check for new words across
        if (
          (index % 15 > 0 && game.board[index - 1] !== ' ') ||
          (index % 15 < 14 && game.board[index + 1] !== ' ')
        ) {
          // we have a new word crossing
          words.push(wordAt(game.board, index, 'A'));
        }
      } else {
        // check for new words down
        if (
          (index >= 15 && game.board[index - 15] !== ' ') ||
          (index < 210 && game.board[index + 15] !== ' ')
        ) {
          // we have a new word crossing
          words.push(wordAt(game.board, index, 'D'));
        }
      }
    } else {
      // invalid play, put the tiles back how they were
      game.board = origBoard;
      return { score: -1, message: 'word must fit on the board' };
    }
  }
  let playedWord = wordAt(game.board, row * 15 + col, direction);
  console.log('played-word = ', playedWord);
  if (playedWord.word.length > 1) {
    words.push(playedWord);
  }
  console.dir(words);
  if (words.length === 1 && words[0].word === tiles && !isNewBoard) {
    console.log('not part of grid');
    game.board = origBoard;
    return {
      score: -1,
      message: 'word must be adjacent to a tile on the board',
    };
  }
  // check all the new words are valid
  let allValid = true;
  let message = 'invalid words: ';
  for (let i = 0; i < words.length; i++) {
    if (!isValidWord(words[i].word.toUpperCase())) {
      console.log('invalid word: ' + words[i].word.toUpperCase());
      message += words[i].word.toUpperCase() + ' ';
      allValid = false;
    }
  }
  if (!allValid) {
    game.board = origBoard;
    return { score: -1, message: message };
  }
  // all the new words are valid. Caculate the score
  score = 0;
  for (let i = 0; i < words.length; i++) {
    score += wordScore(
      words[i].word,
      words[i].index,
      words[i].direction,
      playedTileIndices
    );
  }
  if (numTiles == 7) {
    // bingo!
    score += 50;
  }

  return { score: score, message: '' };
}

function isLowerCase(ch) {
  return ch >= 'a' && ch <= 'z';
}

function removeTiles(game, tiles) {
  console.log('removeTiles');
  let numPlayers = game.players.length;
  for (let i = 0; i < numPlayers; i++) {
    if (game.players[i].user === game.current_player) {
      console.log('user ' + game.current_player);
      console.dir(game.players[i].tiles);
      for (let j = 0; j < tiles.length; j++) {
        let ch = tiles[j];
        console.log('remove ' + ch);
        for (let k = 0; k < game.players[i].tiles.length; k++) {
          if (
            (isLowerCase(ch) && ' ' === game.players[i].tiles[k].letter) ||
            ch === game.players[i].tiles[k].letter
          ) {
            console.log('removing tile at ' + k);
            game.players[i].tiles.splice(k, 1);
            console.dir(game.players[i].tiles);
            break;
          }
        }
      }
    }
  }
}

// TODO:
// isGameComplete
function isGameComplete(game) {
  if (game.free_tiles <= 0) {
    return true;
  }
  let numPlayers = game.players.length;
  for (let i = 0; i < numPlayers; i++) {
    if (game.players[i].user === game.current_player) {
      if (!game.players[i].knocking) {
        return false;
      }
    }
  }
  // nobody can play
  return true;
}

// return ids of all games
router.get('/', function (req, res, next) {
  let ids = [];
  for (let i = 0; i < games.length; i++) {
    ids.push(games[i].id);
  }
  res.json({ games: ids });
});

// return game details
router.get('/:id', function (req, res, next) {
  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;

  var game = findGame(req.params.id);
  if (game) {
    res.json(getGameForUser(game, username));
  } else {
    return res.sendStatus(404);
  }
});

// create a new game
router.post('/', function (req, res, next) {
  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;

  for (var i = 0; i < games.length; i++) {
    if (games[i].owner === username) {
      return res.sendStatus(409);
    }
  }
  // create the tile set and shuffle it now
  let tiles = shuffle(new Tiles().tiles);
  let id = nextId;
  let board = ' '.repeat(225);

  games.push({
    id: id,
    owner: username,
    status: 'waiting',
    players: [],
    current_player: username,
    free_tiles: tiles,
    board: board,
  });
  nextId++;
  res.json({ id: id });
});

// return list of players for a game
router.get('/:id/players', function (req, res, next) {
  let game = findGame(req.params.id);

  if (!game) {
    return res.sendStatus(404);
  }

  let players = [];
  for (let i = 0; i < game.players.length; i++) {
    let player = game.players[i];
    players.push(player.user);
  }
  res.json({ players: players });
});

// add a player to the game
router.post('/:id/players', function (req, res, next) {
  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;
  var game = findGame(req.params.id);
  //console.dir(game);
  let found = false;
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].user === username) {
      found = true;
    }
  }
  if (!found) {
    if (!game || game.status !== 'waiting') {
      return res.sendStatus(404);
    }
    let myTiles = game.free_tiles.splice(0, 7);
    game.players.push({
      user: username,
      tiles: myTiles,
      score: 0,
      knocking: false,
    });
    console.log('calling ws.broadcast');
    ws.broadcast('newplayer', { gameId: game.id, player: username });
  }
  res.json({});
});

// return a player's tiles
router.get('/:id/players/:player/tiles', function (req, res, next) {
  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;

  console.log('username: ' + username);
  if (username !== req.params.player) {
    return res.sendStatus(401);
  }

  let game = findGame(req.params.id);

  if (!game) {
    return res.sendStatus(404);
  }

  let tiles = [];
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].user == username) {
      tiles = game.players[i].tiles;
    }
  }
  res.json({ tiles: tiles });
});

// place some tiles
// the auth user must be a player of the game
//
/*
post data:
{
  row: number,       // 0-based index
  col: number,
  direction: string, // 'A', or 'D'
  tiles: string,     // Tiles to play/change. Upper-case for normal tiles, lower-case for blank
  move_type: string  //'play', 'change', 'pass'
}
returns:
{
  status: string     // 'ok' or error message
}
*/
router.put('/:id', function (req, res, next) {
  console.log('play');

  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;

  console.log('username: ' + username);

  var game = findGame(req.params.id);
  if (!game) {
    return res.sendStatus(404);
  }

  console.log('found game');
  //console.dir(game);

  let found = false;
  let playerTiles = [];
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].user === username) {
      found = true;
      playerTiles = game.players[i].tiles.slice();
    }
  }
  if (!found) {
    return res.sendStatus(401);
  }
  game.status = 'playing';

  console.log('playing');

  if (game.current_player !== username) {
    return res.json({ status: 'not your turn!' });
  }

  console.log('my turn');

  if (req.body.tiles) {
    // check you have the tiles being played
    let used = Array(7).fill(false);
    for (let played of req.body.tiles) {
      let isOwned = false;
      for (let i = 0; i < playerTiles.length; i++) {
        if (
          (playerTiles[i].letter === played && !used[i]) ||
          (isLowerCase(played) && playerTiles[i].isBlank && !used[i])
        ) {
          isOwned = true;
          used[i] = true;
          console.log('char: ' + played + ' is in rack at position ' + i);
          break;
        }
      }
      if (!isOwned) {
        return res.json({ status: "you don't own the letter " + played });
      }
    }
  }
  if (req.body.move_type === 'play') {
    // play the tiles
    let result = playTiles(
      game,
      +req.body.row,
      +req.body.col,
      req.body.direction,
      req.body.tiles
    );
    if (result.score >= 0) {
      console.log('playTiles succeeded');

      // remove the player's tiles
      removeTiles(game, req.body.tiles);

      // fetch some new tiles
      let numTiles = req.body.tiles.length;
      let myTiles = game.free_tiles.splice(0, numTiles);

      // move on to next player
      let numPlayers = game.players.length;
      for (let i = 0; i < numPlayers; i++) {
        if (game.players[i].user === game.current_player) {
          game.players[i].tiles = game.players[i].tiles.concat(myTiles);
          game.players[i].score += result.score;
          game.players[i].knocking = false;
        }
      }
      //console.dir(game);
    } else {
      console.log('playTiles failed');
      return res.json({ status: result.message });
    }
  } else if (req.body.move_type === 'change') {
    // change some tiles
    if (game.free_tiles.length >= 7) {
      // remove the player's tiles
      removeTiles(game, req.body.tiles);
      let numTiles = req.body.tiles.length;

      for (let i = 0; i < numTiles; i++) {
        let tile = makeTile(req.body.tiles[i]);
        game.free_tiles.push(tile);
      }
      game.free_tiles = shuffle(game.free_tiles);
      let myTiles = game.free_tiles.splice(0, numTiles);
      let numPlayers = game.players.length;
      for (let i = 0; i < numPlayers; i++) {
        if (game.players[i].user === game.current_player) {
          game.players[i].tiles = game.players[i].tiles.concat(myTiles);
          game.players[i].knocking = false;
        }
      }
    } else {
      console.log('playTiles failed');
      return res.json({ status: 'not enough free tiles for change' });
    }
  } else if (req.body.move_type === 'pass') {
    let numPlayers = game.players.length;
    for (let i = 0; i < numPlayers; i++) {
      if (game.players[i].user === game.current_player) {
        game.players[i].knocking = true;
      }
    }
  }

  // move on to the next player
  let numPlayers = game.players.length;
  let nextPlayerIndex = 0;
  for (let i = 0; i < numPlayers; i++) {
    if (game.players[i].user === game.current_player) {
      nextPlayerIndex = i + 1;
    }
  }
  if (nextPlayerIndex >= numPlayers) {
    game.current_player = game.players[0].user;
  } else {
    game.current_player = game.players[nextPlayerIndex].user;
  }

  let players = [];
  let tiles = [];
  for (let i = 0; i < game.players.length; i++) {
    let player = game.players[i];
    players.push({ user: player.user, score: player.score });
    if (username === player.user) {
      tiles = player.tiles;
    }
  }
  let obj = {
    id: game.id,
    owner: game.owner,
    players: players,
    current_player: game.current_player,
    status: game.status,
    num_free_tiles: game.free_tiles.length,
    board: game.board,
  };
  ws.broadcast('game', obj);
  return res.json({ status: 'ok', tiles: tiles });
});

router.delete('/:id', function (req, res, next) {
  console.log('delete');

  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;

  console.log('username: ' + username);

  var game = findGame(req.params.id);
  if (!game) {
    return res.sendStatus(404);
  }

  console.log('found game');

  if (game.owner === username) {
    deleteGame(game.id);
  } else {
    return res.sendStatus(401);
  }
});

// find game with given id
//
function findGame(id) {
  for (var i = 0; i < games.length; i++) {
    if (games[i].id == id) {
      return games[i];
    }
  }
  return null;
}

// delete game with given id
//
function deleteGame(id) {
  console.log('deleting game' + id);
  for (var i = 0; i < games.length; i++) {
    if (games[i].id === id) {
      console.log('deleting games[' + i + ']');
      games.splice(i, 1);
      break;
    }
  }
  ws.broadcast('game over', { id: id });
}

module.exports = router;
