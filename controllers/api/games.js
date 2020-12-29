var router = require('express').Router();
var jwt = require('jwt-simple');
var config = require('../../config');
//var ws = require('../../websockets');
var Tile = require('../../tile');
var Tiles = require('../../tiles');
var shuffle = require('lodash.shuffle');
var _ = require('lodash');

var games = [];
var nextId = 1234;
var tileValues = [
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
    let value = tileValue[ch.charCodeAt(0) - 65];
    return new Tile(ch, value, false);
  }
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
  obj = {
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
  //  if (!req.headers['x-auth']) {
  //    return res.sendStatus(401);
  //  }
  //  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = 'Paul'; //auth.username;

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
  let board = ' '.repeat(112) + 'HELLO' + ' '.repeat(108);

  games.push({
    id: id,
    owner: username,
    status: 'waiting',
    players: [],
    current_player: username,
    free_tiles: tiles,
    board: board,
  });
  /*
  ws.broadcast('newgame', {
    id: nextId,
    owner: username,
    status: 'waiting',
    players: [username],
  });
*/
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
  console.dir(game);
  if (!game || game.status !== 'waiting') {
    return res.sendStatus(404);
  }
  found = false;
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].user === username) {
      found = true;
    }
  }
  if (!found) {
    let myTiles = game.free_tiles.splice(0, 6);
    game.players.push({ user: username, tiles: myTiles, score: 0 });
  }
  //ws.broadcast('newplayer', { gameId: game.id, player: username });
  res.sendStatus(201);
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
  if (!req.headers['x-auth']) {
    return res.sendStatus(401);
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret);
  var username = auth.username;

  var game = findGame(req.params.id);
  if (!game) {
    return res.sendStatus(404);
  }
  if (!_.includes(game.players, username)) {
    return res.sendStatus(401);
  }
  game.status = 'playing';

  if (game.current_player !== username) {
    return res.json({ status: 'not your turn!' });
  }

  if (req.body.move_type === 'play') {
    // play the tiles
    //if ( playTiles(game, req.body.row, req.body.col, req.body.tiles) )
    // move on to next player
    let numPlayers = game.players.length;
    let nextPlayerIndex = 0;
    for (let i = 0; i < numPlayers; i++) {
      if (game.players[i].user === game.current_player) {
        nextPlayerIndex = i + 1;
      }
      if (nextPlayerIndex >= numPlayers) {
        game.current_player = game.players[0].user;
      } else {
        game.current_player = game.players[nextPlayerIndex].user;
      }
    }
    return res.json({ status: 'ok' });
  } else if (req.body.move_type === 'change') {
    // change some tiles
    let numTiles = req.body.tiles.length;
    for (let i = 0; i < numTiles; i++) {
      let tile = makeTile(req.body.tiles[i]);
      game.tiles.push(tile);
    }
    game.tiles = shuffle(game.tiles);
    let myTiles = game.tiles.splice(0, numTiles - 1);
    let numPlayers = game.players.length;
    let nextPlayerIndex = 0;
    for (let i = 0; i < numPlayers; i++) {
      if (game.players[i].user === game.current_player) {
        game.players[i].tiles = myTiles;
        nextPlayerIndex = i + 1;
      }
      if (nextPlayerIndex >= numPlayers) {
        game.current_player = game.players[0].user;
      } else {
        game.current_player = game.players[nextPlayerIndex].user;
      }
    }
    return res.json({ status: 'ok' });
  } else {
    // pass
    // move on to next player
    let numPlayers = game.players.length;
    let nextPlayerIndex = 0;
    for (let i = 0; i < numPlayers; i++) {
      if (game.players[i].user === game.current_player) {
        nextPlayerIndex = i + 1;
      }
      if (nextPlayerIndex >= numPlayers) {
        game.current_player = game.players[0].user;
      } else {
        game.current_player = game.players[nextPlayerIndex].user;
      }
    }
    return res.json({ status: 'ok' });
  }
});

var eq = function (c1, c2) {
  return (
    c1.color === c2.color &&
    c1.shape === c2.shape &&
    c1.number === c2.number &&
    c1.fill === c2.fill
  );
};

/**
 * Check if a set has already been submitted
 */
var completed = function (game, set) {
  var card = set[0];
  for (var i = 0; i < game.completedSets.length; i++) {
    for (var j = 0; j < game.completedSets[i].length; j++) {
      if (eq(card, game.completedSets[i][j])) {
        console.log('set is already complete');
        return true;
      }
    }
  }
  //todo: check set[1] and set[2]??
  return false;
};

/**
 * return true if the three cards form a set
 */
var checkSet = function (set) {
  var shape = 0;
  var number = 0;
  var fill = 0;
  var color = 0;
  if (set.length != 3) {
    return false;
  }
  for (var i = 0; i < 3; i++) {
    var card = set[i];
    shape += card.shape;
    number += card.number;
    fill += card.fill;
    color += card.color;
  }
  shape %= 3;
  number %= 3;
  fill %= 3;
  color %= 3;
  return shape === 0 && number === 0 && fill === 0 && color === 0;
};

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
}

module.exports = router;
