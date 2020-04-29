let players = [];
let pseudo = "";

function initArea(cards) {
  let gameArea = document.createElement("div");
  gameArea.className = "area";

  for (let i = 0; i < cards.length; i++) {
    let cardHere = { rank: cards[i][0], value: cards[i][1] };

    let img = document.createElement("img");
    img.className = "card";
    img.src = "../assets/" + cardHere.rank + cardHere.value + ".jpg";
    img.alt = cardHere.rank + cardHere.value;
    img.onclick = () => {
      if (!img.hasAttribute("disabled")) {
        if (gameArea.className === "area playerTurn") {
          sendCard(cardHere);
          img.remove();
          socket.emit("sendCard", i);
        }
      }
    };

    gameArea.appendChild(img);
  }
  document.body.appendChild(gameArea);
  return gameArea;
}

const drawPseudo = () => {
  let frag = document.createDocumentFragment();
  for (let i = 1; i < players.length; i++) {
    let pseudoText = document.createElement("div");
    pseudoText.className = "text pseudoText pseudo" + (i + 1).toString();
    pseudoText.innerText = players[i];
    frag.appendChild(pseudoText);
  }
  document.body.appendChild(frag);
};

const waitingPlayer = waitingPlayers => {
  let temp = document.getElementById("waiting");
  if (temp !== null) {
    temp.remove();
  }
  players = waitingPlayers;
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
  input.required = true;
  input.oninvalid = () => {
    input.setCustomValidity("Entrez un pseudo!");
  };
  input.oninput = () => {
    input.setCustomValidity("");
  };
  input.onkeyup = event => {
    if (event.keyCode === 13) {
      button.click();
    }
  };

  let button = document.createElement("button");
  button.innerText = "Valider";
  button.className = "btn btn-primary";
  button.id = "btnPseudo";
  button.type = "submit";
  button.onclick = () => {
    if (input.checkValidity()) {
      socket.emit("sendPseudo", input.value);
      input.remove();
      button.remove();
      pseudo = input.value;
    } else {
      input.focus();
    }
  };
  let form = document.createElement("form");
  form.appendChild(input);
  form.appendChild(button);
  document.body.appendChild(form);
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

function movePlayers(pos) {
  let temp = [];
  for (let i = 0; i < players.length; i++) {
    temp.push(players[(i + pos) % players.length]);
  }
  players = temp;
}

function drawPlayerCard(card, pseudoCard) {
  let playerIndex = players.findIndex(val => val === pseudoCard);

  let img = document.createElement("img");
  img.className = "otherCard player" + (playerIndex + 1).toString();
  img.src = "../assets/" + card.rank + card.value + ".jpg";
  img.alt = card.rank + card.value;

  document.body.appendChild(img);
}

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
  let playerPos = players.findIndex(val => val === pseudo);
  movePlayers(playerPos);

  document.getElementById("waiting").remove();
  let starting = document.createElement("div");
  starting.className = "text";
  starting.id = "waiting";
  starting.style.left = "50%";
  starting.style.top = "50%";
  starting.style.transform = "translate(-50%, 0%)";
  document.body.appendChild(starting);
  // let secondes = 10;
  let secondes = 2;
  starting.innerText = "Le jeu commence dans " + secondes.toString() + " secondes...";
  setInterval(() => {
    secondes--;
    if (secondes === 0) {
      starting.innerText = "Le jeu commence";
      setTimeout(() => {
        starting.remove();
        drawPseudo();
      }, 1000);
      clearInterval(this);
    }
    starting.innerText = "Le jeu commence dans " + secondes.toString() + " secondes...";
  }, 1000);
});

function push() {
  socket.emit("logPlayers");
}

function reset() {
  socket.emit("reset");
}

function sendCard(card) {
  socket.emit("cardPlayed", card);
  document.getElementsByClassName("area playerTurn")[0].className = "area";
  let img = document.createElement("img");
  img.className = "otherCard playerCard";
  img.src = "../assets/" + card.rank + card.value + ".jpg";
  document.body.appendChild(img);
}

socket.on("yourCards", cards => {
  initArea(cards);
});

function sendChoice(choice) {
  socket.emit("setChoice", { choice: choice, player: pseudo });
}

function displayChoiceButton(disabledChoice) {
  let div = document.createElement("div");
  div.className = "priseGrid";

  let choice = ["Passe", "Petite", "Garde", "Garde contre", "Garde sans", "Chelem", "Trier"];

  for (let index in choice) {
    let button = document.createElement("button");
    if (choice[index] === "Passe") {
      button.className = "btn btn-success";
    } else if (choice[index] === "Trier") {
      button.className = "btn btn-danger";
      button.disabled = true;
    } else if (choice[index] === "Chelem") {
      button.className = "btn btn-dark";
    } else {
      button.className = "btn btn-warning";
    }
    if (choice[index] === disabledChoice) {
      button.disabled = true;
    }
    button.innerText = choice[index];
    button.onclick = () => {
      sendChoice(choice[index]);
      div.remove();
    };
    button.style.left = (20 + index * 10).toString() + "vw";

    div.appendChild(button);
  }
  document.body.appendChild(div);
}

socket.on("choice", displayChoiceButton);

socket.on("yourTurn", () => {
  document.getElementsByClassName("area")[0].className += " playerTurn";
});

socket.on("clean", () => {
  let timer = setInterval(() => {
    let cards = document.getElementsByClassName("otherCard");
    if (cards[0] === undefined) {
      clearInterval(timer);
      return;
    }
    cards[0].remove();
  }, 10);
});
