const http = require("http");
const express = require("express");
const cards = require("./cards");

//server declaration
const app = express();
const clientPath = "../client/";
app.use(express.static(clientPath));
const server = http.createServer(app);
const io = require("socket.io")(server);

io.on("connection", socket => {
  console.log("Someone connected.");
  console.log(socket.client);
});

//server error detection
server.on("error", err => {
  console.error(err);
});

//server port listen
server.listen(8080, () => {
  console.log("Started on 8080");
});
