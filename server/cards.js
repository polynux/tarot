let deck = [];
const playersDeck = [[], [], [], [], []];
let chien = [];

const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const initDeck = () => {
  deck = [];
  const rang = ["coeur", "pique", "carreau", "trefle"];
  const carte = "1 2 3 4 5 6 7 8 9 10 v c d r".split(" ");
  for (let rank of rang) {
    for (let value of carte) {
      deck.push([rank, value]);
    }
  }
  for (let i = 1; i <= 21; i++) {
    deck.push(["atout", i.toString()]);
  }
  deck.push(["atout", "excuse"]);
};

const sortDeck = array => {
  return array.sort((a, b) => {
    if (a[0] === "atout" && b[0] !== "atout") return 1;
    if (a[0] !== "atout" && b[0] === "atout") return -1;
    if (a[0] === "atout" && b[0] === "atout") {
      if (a[1] === "excuse") return 1;
      if (b[1] === "excuse") return -1;
      return a[1] - b[1];
    }
    if (a[0] !== "atout" && b[0] !== "atout") {
      if (a[0] === "coeur" && b[0] !== "coeur") return 1;
      if (a[0] !== "coeur" && b[0] === "coeur") return -1;
      if (a[0] === "pique" && b[0] !== "pique") return 1;
      if (a[0] !== "pique" && b[0] === "pique") return -1;
      if (a[0] === "carreau" && b[0] !== "carreau") return 1;
      if (a[0] !== "carreau" && b[0] === "carreau") return -1;
      if (a[0] === "trefle" && b[0] !== "trefle") return 1;
      if (a[0] !== "trefle" && b[0] === "trefle") return -1;

      if (a[1] === "r" && b[1] !== "r") return 1;
      if (a[1] !== "r" && b[1] === "r") return -1;
      if (a[1] === "d" && b[1] !== "d") return 1;
      if (a[1] !== "d" && b[1] === "d") return -1;
      if (a[1] === "c" && b[1] !== "c") return 1;
      if (a[1] !== "c" && b[1] === "c") return -1;
      if (a[1] === "v" && b[1] !== "v") return 1;
      if (a[1] !== "v" && b[1] === "v") return -1;
      return a[1] - b[1];
    }
  });
};

const drawCardsFive = () => {
  let playerCountDraw = 0;
  let previousChien = 0;
  let index = 0;
  while (index < deck.length) {
    if (Math.random() < 0.2 && index < deck.length - 3 && chien.length < 3 && index > previousChien + 2) {
      chien.push(deck[index]);
      previousChien = index;
      index++;
      continue;
    }
    if (index === deck.length - 4 && chien.length === 2) {
      chien.push(deck[index]);
      index++;
      continue;
    }
    if (index === deck.length - 8 && chien.length === 1) {
      chien.push(deck[index]);
      index++;
      continue;
    }
    if (index === deck.length - 12 && chien.length === 0) {
      chien.push(deck[index]);
      index++;
      continue;
    }
    playersDeck[playerCountDraw % 5].push(deck[index], deck[index + 1], deck[index + 2]);
    index += 3;
    playerCountDraw++;
  }
};

const drawCardsFour = () => {};

const drawCardsThree = () => {};

const drawCards = playerNumber => {
  switch (playerNumber) {
    case 3:
      drawCardsThree();
      break;
    case 4:
      drawCardsFour();
      break;
    case 5:
      drawCardsFive();
      break;
    default:
      throw "Rentrez un nombre valide de joueurs!";
  }
};

const newGame = playerNumber => {
  initDeck();
  for (let i = 0; i < 100; i++) {
    shuffle(deck);
  }
  drawCards(playerNumber);
};

newGame(5);

const logDeck = () => console.log(deck);

const getDeck = () => deck;
const getPlayersDeck = () => playersDeck;

module.exports = {
  shuffle,
  initDeck,
  logDeck,
  newGame,
  getDeck,
  getPlayersDeck
};
