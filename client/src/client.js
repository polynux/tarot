let cardWidth = window.innerWidth / 10;
let cardHeight = cardWidth * 1.92;
let cardGap = (5 * cardWidth) / 4;

let numCard = 18;

let cards = [
  ["atout", "10"],
  ["pique", "d"],
  ["atout", "21"],
  ["atout", "3"]
];

let cardlist = [];

class Card {
  constructor() {
    this.width = cardWidth.toString() + "px";
    this.height = cardHeight.toString() + "px";
    this.rank = "";
    this.value = "";
  }
  setValue(rank, value) {
    this.rank = rank;
    this.value = value;
  }
}

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
    //card.id = cards[i][0] + "," + cards[i][1];

    let cardHere = new Card();
    cardHere.setValue(cards[i][0], cards[i][1]);

    let img = document.createElement("img");
    img.className = "card";
    img.id = cardHere.rank + "," + cardHere.value;
    img.src = "../assets/" + cardHere.rank + cardHere.value + ".png";
    img.onclick = () => {
      console.log(img.id);
    };

    card.appendChild(img);

    gameArea.appendChild(card);
  }
  let frag = document.createDocumentFragment();
  frag.appendChild(gameArea);
  document.body.appendChild(frag);
}

initArea(cards);
