let cardWidth = window.innerWidth / 10;
let cardHeight = cardWidth * 1.92;
let cardGap = (5 * cardWidth) / 4;

function initArea(cards) {
  let gameArea = document.createElement("div");
  gameArea.style.height = cardHeight.toString() + "px";
  gameArea.className = "area";

  //calculate space for positioning card
  let space = (0.8 * window.innerWidth) / (cards.length + 1);

  for (let i = 0; i < cards.length; i++) {
    let pos = space * (i + 1) - cardWidth / 2;

    //calculate position for low number of cards
    if (space > cardGap) {
      let totWidth = cardGap * cards.length;
      let posOri = (0.8 * window.innerWidth - totWidth) / 2;
      pos = posOri + cardGap * i;
    }

    let card = document.createElement("div");
    card.style.width = cardWidth.toString() + "px";
    card.style.height = cardHeight.toString() + "px";
    card.style.left = pos.toString() + "px";
    card.style.position = "absolute";

    let cardHere = { rank: cards[i][0], value: cards[i][1] };

    let img = document.createElement("img");
    img.className = "card";
    img.style.borderRadius = (cardWidth / 10).toString() + "px";
    img.id = cardHere.rank + "," + cardHere.value;
    img.src = "../assets/" + cardHere.rank + cardHere.value + ".jpg";
    img.alt = cardHere.rank + cardHere.value;
    img.onclick = () => {
      sendCard(cardHere);
    };

    card.appendChild(img);

    gameArea.appendChild(card);
  }
  let frag = document.createDocumentFragment();
  frag.appendChild(gameArea);
  document.body.appendChild(frag);
}

const drawPseudo = pseudo => {
  let pseudoText = document.createElement("div");
  pseudoText.className = "text";
  pseudoText.style.textAlign = "left";
  pseudoText.innerText = pseudo;
  document.body.appendChild(pseudoText);
};

const waitingPlayer = waitingPlayers => {
  let temp = document.getElementById("waiting");
  if (temp !== null) {
    temp.remove();
  }
  let waiting = document.createElement("div");
  waiting.id = "waiting";
  waiting.className = "text";
  let temp2 = "";
  waitingPlayers.forEach(player => (temp2 += " " + player));
  waiting.innerText = `Waiting players :${temp2}`;
  waiting.style.left = "50%";
  waiting.style.transform = "translate(-50%, 0%)";
  document.body.appendChild(waiting);
};

const initPseudo = () => {
  let input = document.createElement("input");
  input.className = "form-control";
  input.type = "text";
  input.id = "inputPseudo";
  input.placeholder = "Entrer votre pseudo";
  let button = document.createElement("button");
  button.innerText = "Valider";
  button.className = "btn btn-primary";
  button.id = "btnPseudo";
  button.type = "submit";
  button.onclick = () => {
    socket.emit("sendPseudo", input.value);
    input.remove();
    button.remove();
    drawPseudo(input.value);
  };
  document.body.appendChild(input);
  document.body.appendChild(button);

  document.getElementById("inputPseudo").addEventListener("keyup", event => {
    if (event.keyCode === 13) {
      document.getElementById("btnPseudo").click();
    }
  });
};

function setPlayerNumber() {
  let divButtons = document.createElement("div");
  for (let i = 0; i < 3; i++) {
    let playerButton = document.createElement("button");
    playerButton.innerText = (i + 3).toString() + " Joueurs";
    playerButton.style = "position: absolute; left: 50%; top: 50%;";
    playerButton.style.transform = "translate(" + ((i - 1) * 120 - 50).toString() + "%, 0%)";
    playerButton.type = "submit";
    playerButton.className = "btn btn-success";
    if (i !== 2) {
      playerButton.disabled = true;
    }

    playerButton.onclick = () => {
      socket.emit("sendPlayerNumber", i + 3);
      divButtons.remove();
      initPseudo();
    };
    divButtons.appendChild(playerButton);
  }
  document.body.appendChild(divButtons);
}

function drawPlayerCard(card) {
  let img = document.createElement("img");
  let div = document.createElement("div");
  div.appendChild(img);
  div.style.width = cardWidth.toString() + "px";
  div.style.height = cardHeight.toString() + "px";
  div.style.position = "absolute";
  div.style.left = "50%";
  div.style.top = "50%";
  div.style.transform = "translate(-50%,-50%)";

  img.className = "card unclickable";
  img.style.borderRadius = (cardWidth / 10).toString() + "px";
  img.id = card.rank + "," + card.value;
  img.src = "../assets/" + card.rank + card.value + ".jpg";
  img.alt = card.rank + card.value;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

//setPlayerNumber();

//initId();

const socket = io();

socket.emit("getPlayerNumber");
socket.on("sendPlayerNumber", playerCount => {
  if (playerCount !== 0) {
    initPseudo();
  } else {
    setPlayerNumber();
  }
});

socket.on("waitingPlayers", waitingPlayer);

socket.on("cardPlayed", drawPlayerCard);

socket.on("tooManyPlayers", () => {
  alert("Too many players!");
});
socket.on("logToAll", message => console.log(`%c${message}`, "color: green"));

socket.on("ready", () => {
  document.getElementById("waiting").remove();
  let starting = document.createElement("div");
  starting.className = "text";
  starting.id = "waiting";
  starting.style.left = "50%";
  starting.style.top = "50%";
  starting.style.transform = "translate(-50%, 0%)";
  document.body.appendChild(starting);
  let secondes = 10;
  starting.innerText = "Le jeu commence dans " + secondes.toString() + " secondes...";
  setInterval(() => {
    secondes--;
    if (secondes === 0) {
      starting.innerText = "Le jeu commence";
      setTimeout(() => {
        starting.remove();
      }, 1000);
      clearInterval(this);
    }
    starting.innerText = "Le jeu commence dans " + secondes.toString() + " secondes...";
  }, 1000);
});

function push() {
  socket.emit("logPlayers");
}

function clear() {
  socket.emit("clear");
}

function sendCard(card) {
  socket.emit("cardPlayed", card);
}

socket.on("yourCards", cards => {
  initArea(cards);
});
