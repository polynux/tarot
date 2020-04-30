const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cards = require("./cards");

//server declaration
const app = express();
const clientPath = "../client/";
app.use(morgan("common"));
app.use(express.static(clientPath));
const server = http.createServer(app);
const io = require("socket.io")(server);

let players = { ids: {} };
let playersDeck = [];
let deck = [];
let game = { order: [], playerCount: 0, currentChoice: { player: "", choice: "" }, currentPlayer: "" };
let round = { current: [], win: [], lose: [] };

function idFromPseudo(pseudo) {
  return players[pseudo].id;
}
const pseudoFromId = id => {
  return players.ids[id].player;
};
function indexFromArray(array, val) {
  return array.findIndex(el => el === val);
}
function indexFromArrayById(array, id) {
  let pseudo = pseudoFromId(id);
  return array.findIndex(el => el === pseudo);
}

function initPlayers(pseudo, socket) {
  if (players[pseudo]) {
    delete players.ids[idFromPseudo(pseudo)];
    players[pseudo].id = socket.id;
    players.ids[socket.id] = { player: pseudo };
  } else {
    players[pseudo] = { id: socket.id };
    players.ids[socket.id] = { player: pseudo };
  }
  if (game.order.includes(pseudo)) {
    console.log("Déjà en partie");
    socket.emit("yourCards", playersDeck[indexFromArray(game.order, pseudo)]);
    socket.emit("reconnection", game.order);
    if (game.currentPlayer === pseudo) {
      socket.emit("yourTurn", round.current);
    }
  } else {
    game.order.push(pseudo);
    io.emit("waitingPlayers", game.order);
  }
}

function setChoice(choix) {
  game.currentChoice = choix; //choix {player,choice}

  let pseudoIndex = indexFromArray(game.order, choix.player);
  if (pseudoIndex + 1 === game.order.length) {
    return startGame();
  }
  let nextPlayer = game.order[pseudoIndex + 1];
  io.to(idFromPseudo(nextPlayer)).emit("choice", game.currentChoice);
}

function sendCards() {
  playersDeck = cards.getPlayersDeck();
  for (let i = 0; i < game.order.length; i++) {
    let player = game.order[i];
    io.to(idFromPseudo(player)).emit("yourCards", playersDeck[i]);
  }
  io.to(idFromPseudo(game.order[0])).emit("choice", game.currentChoice.choice);
}

function startGame() {
  io.emit("startGame");
  io.to(idFromPseudo(game.order[0])).emit("yourTurn");
  currentPlayer = game.order[0];
  console.log("start");
}

function nextPlayer(pseudo) {
  let currentIndex = indexFromArray(game.order, pseudo);
  if (currentIndex + 1 === game.order.length) {
    currentIndex = 0;
    io.emit("clean");
  } else {
    currentIndex++;
  }
  io.to(idFromPseudo(game.order[currentIndex])).emit("yourTurn");
  game.currentPlayer = game.order[currentIndex];
}

io.on("connection", socket => {
  socket.on("sendPlayerNumber", num => {
    if (game.playerCount === 0 || num in [3, 4, 5]) {
      game.playerCount = num;
    } else {
      socket.emit("errorSetPlayer", "PlayerCount is already set!");
    }
  });

  socket.on("cardPlayed", card => {
    let pseudo = pseudoFromId(socket.id);
    socket.broadcast.emit("cardPlayed", card, pseudo);
  });

  // get pseudo from client
  socket.on("sendPseudo", pseudo => {
    if (game.order.length < game.playerCount) {
      initPlayers(pseudo, socket);
      io.emit("logToAll", "Welcome to " + pseudo);
      if (game.order.length === game.playerCount) {
        io.emit("ready");
        // setTimeout(sendCards, 11000);
        setTimeout(sendCards, 3000);
      }
    } else if (game.order.includes(pseudo)) {
      initPlayers(pseudo, socket);
    } else {
      socket.emit("tooManyPlayers");
    }
  });

  socket.on("getPlayerNumber", () => {
    socket.emit("sendPlayerNumber", game.playerCount);
  });

  socket.on("logPlayers", () => {
    console.log(players);
  });

  socket.on("reset", () => {
    players = { ids: {} };
    playersDeck = [];
    deck = [];
    game = { order: [], playerCount: 0, currentChoice: { player: "", choice: "" }, currentPlayer: "" };
    round = { current: [], win: [], lose: [] };
    cards.newGame(5);
  });

  socket.on("sendCard", cardPos => {
    let card = playersDeck[indexFromArrayById(game.order, socket.id)][cardPos];
    deck.push(card);
    if (round.current.length < 5) {
      round.current.push(card);
    }
    playersDeck[indexFromArrayById(game.order, socket.id)].splice(cardPos, 1);
    let pseudo = pseudoFromId(socket.id);
    nextPlayer(pseudo);
  });

  socket.on("setChoice", setChoice);
});

//server error detection
server.on("error", err => {
  console.error(err);
});

//server port listen
server.listen(8080, () => {
  console.log("Started on 8080");
});
