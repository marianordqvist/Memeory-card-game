let gameContainerEl = document.querySelector("#gameContainer");
let startContainerEl = document.querySelector("#startContainer");
let nameInputEl = document.querySelector("#nameInput");
let startButtonEl = document.querySelector("#startButton");
let formEl = document.querySelector("#form");
let endScreenEl = document.querySelector("#endScreen");
let resetButtonEl = document.querySelector("#resetButton");

let userName = "";
let gameActive = false;

let correctGuesses = 0;
let neededGuesses = 0;

const maxTime = 75;
const endTimeout = 10000;
let timer = maxTime;

let scoreData = [];
loadPlayerData();

async function prepareGame() {
  let apiImages = await fetchData();
  const deck = createDeck(apiImages);
  neededGuesses = deck.length;
  let shuffledCards = shuffleCards(deck);
  startGame(shuffledCards);
  gameActive = true;
  correctGuesses = 0;
  showTimer();
}

async function fetchData() {
  let apiUrl = "./api/meme.json";
  try {
    let response = await fetch(apiUrl);
    let result = await response.json();

    return result;
  } catch {
    console.log("API error");
  }
}

function createDeck(cards) {
  const shuffledCards = shuffleArray(cards);
  return shuffledCards.slice(-10);
}

function shuffleCards(deck) {
  const cards = deck.concat(deck);
  return shuffleArray(cards);
}

function shuffleArray(array) {
  return array.toSorted(() => Math.random() - 0.5);
}

//Function to generate the HTML
function startGame(cards) {
  for (let i = 0; i < cards.length; i++) {
    let card = document.createElement("div");
    let face = document.createElement("img");
    let back = document.createElement("div");
    card.classList = "card";
    face.classList = "face";
    back.classList = "back";
    face.src = cards[i].url;
    card.setAttribute("name", cards[i].name);
    gameContainerEl.appendChild(card);
    card.appendChild(face);
    card.appendChild(back);

    card.addEventListener("click", function (e) {
      toggleCard(card);
      compareCards(e);
    });
  }
}

function showTimer() {
  let timerEl = document.querySelector("#gameTimer");
  timerEl.style.visibility = "visible";
}

//Check cards
function compareCards(e) {
  let clickedCard = e.target;
  selectCard(clickedCard);

  let selectedCards = document.querySelectorAll(".selected");

  //comparison
  if (selectedCards.length !== 2) {
    return;
  }

  if (checkEqualCards(selectedCards[0], selectedCards[1])) {
    playMatchSound();
    checkWinCondition();
    disablePointerEvents(selectedCards[0]);
    disablePointerEvents(selectedCards[1]);
  } else {
    setTimeout(function () {
      if (gameActive === false) {
        return;
      }
      toggleCard(selectedCards[0]);
      toggleCard(selectedCards[1]);
      playUnFlipSound();
    }, 1000);
  }

  unselectCard(selectedCards[0]);
  unselectCard(selectedCards[1]);
}

function checkWinCondition() {
  correctGuesses += 1;
  if (correctGuesses >= neededGuesses) {
    gameActive = false;
    storePlayerData();
    endScreenEl.innerHTML = "You Win!";
    endScreenEl.classList.add("end-screen-shown");
    playWinSound();
    setTimeout(resetGame, endTimeout);
  }
}

function disablePointerEvents(card) {
  card.style.pointerEvents = "none";
}

function selectCard(card) {
  card.classList.add("selected");
  playFlipSound();
}

function unselectCard(card) {
  card.classList.remove("selected");
}

function toggleCard(card) {
  card.classList.toggle("toggleCard");
}

function addToggleCard(card) {
  card.classList.add("toggleCard");
}

function checkEqualCards(card1, card2) {
  return card1.getAttribute("name") === card2.getAttribute("name");
}

setInterval(gameTimer, 1000);

//Timer
function gameTimer() {
  if (gameActive === false) {
    return;
  }
  timer -= 1;

  let timerEl = document.querySelector("#gameTimer");
  timerEl.innerHTML = "Timer: " + timeConvert(timer);
  if (timer > 12) {
    timerEl.classList.remove("game-timer-low");
  }
  if (timer === 13) {
    timerEl.classList.add("game-timer-low");
    timerLow.play();
  }

  if (timer <= 0) {
    endGame();
  }
}

function timeConvert(timer) {
  let minutes = Math.floor(timer / 60);
  let seconds = timer - minutes * 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}

function endGame() {
  gameActive = false;
  let cardEl = document.querySelectorAll(".card");
  for (let i = 0; i < cardEl.length; i++) {
    addToggleCard(cardEl[i]);
  }
  endScreenEl.innerHTML = "You Lose!";
  endScreenEl.classList.add("end-screen-shown");
  playLoseSound();
  setTimeout(resetGame, endTimeout);
}

function storePlayerData() {
  let timeUsed = maxTime - timer;
  const maxScoreEntries = 10;
  scoreData.push({ time: timeUsed, name: userName });
  scoreData.sort((b, a) => b.time - a.time);
  if (scoreData.length > maxScoreEntries) {
    scoreData.length = maxScoreEntries;
  }
  localStorage.setItem("scores", JSON.stringify(scoreData));
  createScoreBoard();
}

function loadPlayerData() {
  scoreData = JSON.parse(localStorage.getItem("scores")) || [];
  createScoreBoard();
}

function createScoreBoard() {
  clearScoreBoard();
  let scoreBoardEl = document.querySelector("#scoreBoard");
  for (let i = 0; i < scoreData.length; i++) {
    let userScoreEl = document.createElement("div");
    userScoreEl.classList.add("score");
    const userScore = formatUserScore(i, scoreData[i]);
    userScoreEl.innerHTML = userScore;
    scoreBoardEl.append(userScoreEl);
  }
}

function formatUserScore(index, userData) {
  const usersRank = index + 1;
  const userName = userData.name;
  const userTime = timeConvert(userData.time);
  const userScore = `${usersRank}. ${userName} ${userTime}`;
  return userScore;
}

function clearScoreBoard() {
  let scores = document.querySelectorAll(".score");
  for (let i = 0; i < scores.length; i++) {
    scores[i].remove();
  }
}

function resetGame() {
  stopSounds();
  gameActive = false;
  endScreenEl.classList.remove("end-screen-shown");
  let timerEl = document.querySelector("#gameTimer");
  timerEl.style.visibility = "hidden";
  let card = document.querySelectorAll(".card");
  for (let i = 0; i < card.length; i++) {
    card[i].remove();
  }
  timer = maxTime;
  startContainerEl.classList.remove("start-container-hidden");
}

// Sounds effects
function playFlipSound() {
  flipSound.play();
}

function playUnFlipSound() {
  unflipSound.play();
}

function playWinSound() {
  timerLow.pause();
  winSound.play();
}

function playLoseSound() {
  loseSound.play();
}

function playMatchSound() {
  matchSound.play();
}

const matchSound = new Audio("./sounds/Match.mp3");
const loseSound = new Audio("./sounds/Lose.mp3");
const winSound = new Audio("./sounds/Win.mp3");
const unflipSound = new Audio("./sounds/Unflip.mp3");
const flipSound = new Audio("./sounds/Flip.mp3");
const timerLow = new Audio("./sounds/TimeLow.mp3");

const sounds = [
  matchSound,
  loseSound,
  winSound,
  unflipSound,
  flipSound,
  timerLow,
];

function stopSounds() {
  sounds.forEach((element) => {
    element.pause();
    element.currentTime = 0;
  });
}

//eventlisteners

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  userName = nameInputEl.value;
  prepareGame().then(() => {
    startContainerEl.classList.add("start-container-hidden");
    nameInputEl.value = "";
    resetButtonEl.style.visibility = "visible";
  });
});

resetButtonEl.addEventListener("click", function () {
  resetGame();
  resetButtonEl.style.visibility = "hidden";
});
