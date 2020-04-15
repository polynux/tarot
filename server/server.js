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

let players = { order: [], playerCount: 0 };

const initPlayers = (pseudo, socket) => {
  if (players[pseudo]) {
    players[pseudo].id = socket.id;
  } else {
    players[pseudo] = { id: socket.id, cards: [] };
  }
  if (players.order.includes(pseudo)) {
    //rejoinParty();
    console.log("Déjà en partie");
  } else {
    players.order.push(pseudo);
  }
  io.emit("waitingPlayers", players.order);
};

const sendCards = () => {
  let playerDeck = cards.getPlayerDeck();
  for (let i = 0; i < players.order.length; i++) {
    let player = players.order[i];
    io.to(players[player].id).emit("yourCards", playerDeck[i]);
  }
};

io.on("connection", socket => {
  socket.on("sendPlayerNumber", num => {
    if (players.playerCount === 0 || num in [3, 4, 5]) {
      players.playerCount = num;
    } else {
      socket.emit("errorSetPlayer", "PlayerCount is already set!");
    }
  });

  socket.on("cardPlayed", card => {
    socket.broadcast.emit("cardPlayed", card);
  });

  // get pseudo from client
  socket.on("sendPseudo", pseudo => {
    //pseudo = pseudoHere;
    if (players.order.length < players.playerCount) {
      initPlayers(pseudo, socket);
      io.emit("logToAll", "Welcome to " + pseudo);
      if (players.order.length === players.playerCount) {
        io.emit("ready");
        setTimeout(sendCards, 11000);
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

  socket.on("clear", () => (players = { order: [], playerCount: 0 }));
});

//server error detection
server.on("error", err => {
  console.error(err);
});

//server port listen
server.listen(8080, () => {
  console.log("Started on 8080");
});
