const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cards = require("./cards");

//server declaration
const app = express();
const clientPath = "../client/";
app.use(morgan("dev"));
app.use(express.static(clientPath));
const server = http.createServer(app);
const io = require("socket.io")(server);

let players = { order: [], playerCount: 0, deck: [], currentChoice: { player: "", choice: "" }, ids: {} };

function idFromPseudo(pseudo) {
  return players[pseudo].id;
}
function pseudoFromId(id) {
  return players.ids[id].player;
}
function indexFromArray(array, val) {
  return array.findIndex(el => el === val);
}

function initPlayers(pseudo, socket) {
  if (players[pseudo]) {
    delete players.ids[idFromPseudo(pseudo)];
    players[pseudo].id = socket.id;
    players.ids[socket.id] = { player: pseudo };
  } else {
    players[pseudo] = { id: socket.id, cards: [] };
    players.ids[socket.id] = { player: pseudo };
  }
  if (players.order.includes(pseudo)) {
    console.log("Déjà en partie");
  } else {
    players.order.push(pseudo);
  }
  io.emit("waitingPlayers", players.order);
}

function setChoice(choix) {
  players.currentChoice = choix; //choix {player,choice}

  let pseudoIndex = indexFromArray(players.order, choix.player);
  if (pseudoIndex + 1 === players.order.length) {
    return startGame();
  }
  let nextPlayer = players.order[pseudoIndex + 1];
  io.to(idFromPseudo(nextPlayer)).emit("choice", players.currentChoice);
}

function sendCards() {
  let playerDeck = cards.getPlayerDeck();
  for (let i = 0; i < players.order.length; i++) {
    let player = players.order[i];
    io.to(idFromPseudo(player)).emit("yourCards", playerDeck[i]);
  }
  io.to(idFromPseudo(players.order[0])).emit("choice", players.currentChoice.choice);
}

function startGame() {
  io.emit("startGame");
  io.to(idFromPseudo(players.order[0])).emit("yourTurn");
  currentPlayer = players.order[0];
  console.log("start");
}

function nextPlayer(pseudo) {
  let currentIndex = indexFromArray(players.order, pseudo);
  if (currentIndex + 1 === players.order.length) {
    currentIndex = 0;
    io.emit("clean");
  } else {
    currentIndex++;
  }
  io.to(idFromPseudo(players.order[currentIndex])).emit("yourTurn");
}

io.on("connection", socket => {
  socket.on("sendPlayerNumber", num => {
    if (players.playerCount === 0 || num in [3, 4, 5]) {
      players.playerCount = num;
    } else {
      socket.emit("errorSetPlayer", "PlayerCount is already set!");
    }
  });

  socket.on("cardPlayed", card => {
    socket.broadcast.emit("cardPlayed", card, pseudoFromId(socket.id));
  });

  // get pseudo from client
  socket.on("sendPseudo", pseudo => {
    //pseudo = pseudoHere;
    if (players.order.length < players.playerCount) {
      initPlayers(pseudo, socket);
      io.emit("logToAll", "Welcome to " + pseudo);
      if (players.order.length === players.playerCount) {
        io.emit("ready");
        // setTimeout(sendCards, 11000);
        setTimeout(sendCards, 3000);
      }
    } else {
      socket.emit("tooManyPlayers");
    }
  });

  socket.on("getPlayerNumber", () => {
    socket.emit("sendPlayerNumber", players.playerCount);
  });

  socket.on("logPlayers", () => {
    console.log(players);
  });

  socket.on(
    "reset",
    () => (players = { order: [], playerCount: 0, deck: [], currentChoice: { player: "", choice: "" }, ids: {} })
  );

  socket.on("sendCard", cardPos => {
    let deck = [players.deck, players[pseudoFromId(socket.id)].cards[cardPos]];
    players.deck.push(deck);
    players[pseudoFromId(socket.id)].cards.splice(cardPos, 1);
    nextPlayer(pseudoFromId(socket.id));
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
