//Global Constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence
const maxMistakes = 2;

//Global Variables
var clueHoldTime = 1000; //how long to hold each clue's light/sound

//randomly generated array of size 6 with integers from 1 to 5 (inclusive)
var pattern = Array(6)
  .fill()
  .map(() => Math.floor(5 * Math.random() + 1));
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;
var mistakesCount = 0;

//add ripple effect to all MDC buttons
const buttons = document.querySelectorAll(".mdc-button");
for (const button of buttons) {
  mdc.ripple.MDCRipple.attachTo(button);
}

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  mistakesCount = 0;

  //set the number of lives remaining
  updateLivesLeftText();

  //Swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;

  //Swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

function winGame() {
  stopGame();
  alert("Game Over. You won!");
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function updateLivesLeftText() {
  let livesLeft = maxMistakes - mistakesCount + 1;
  document.getElementById("livesLeft").innerHTML = `${livesLeft} lives left`;

  //loop for livesleft and set make sure not hidden
  for (let i = 1; i <= livesLeft; i++) {
    document.getElementById(`heart${i}`).classList.remove("hidden");
  }

  //hide as many hearts as value of mistakesCount. Start iterating from end because prev loop started unhiding from start.
  for (let i = 0; i < mistakesCount; i++) {
    document.getElementById(`heart${maxMistakes - i}`).classList.add("hidden");
  }
}

async function setRandomCat(btn) {
  let response = await fetch("https://api.thecatapi.com/v1/images/search");
  var data = await response.json();
  console.log(data[0].url);
  let image_url = data[0].url;

  document.getElementById(
    "button" + btn
  ).style.backgroundImage = `url(${image_url})`;
  document.getElementById("button" + btn).style.backgroundSize = "90% 90%";
  document.getElementById("button" + btn).style.backgroundRepeat = "no-repeat";
  document.getElementById("button" + btn).style.backgroundPosition = "center";
}

function guess(btn) {
  setRandomCat(btn);

  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }

  //Game Logic

  //if guess is correct
  if (pattern[guessCounter] == btn) {
    //if turn is over
    if (guessCounter == progress) {
      //if last turn
      if (progress == pattern.length - 1) {
        winGame();
      } else {
        //Add next part of pattern onto the game
        progress++;
        playClueSequence();
      }
    } else {
      //move to next guess
      guessCounter++;
    }
  }
  //Guess was incorrect
  else {
    if (mistakesCount == maxMistakes) {
      loseGame();
    } else {
      mistakesCount++;
      updateLivesLeftText();
    }
  }
}

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  context.resume();
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
    clueHoldTime -= 10;
  }
}

// Sound Synthesis Functions
const freqMap = {
  1: 361.6,
  2: 229.6,
  3: 492,
  4: 866.2,
  5: 323.2,
};
function playTone(btn, len) {
  startTone(btn);

  tonePlaying = true;
  setTimeout(function () {
    stopTone(btn);
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    document.getElementById(`audio${btn}`).play();
    tonePlaying = true;
  }
}
function stopTone(btn) {
  document.getElementById(`audio${btn}`).currentTime = 0;
  document.getElementById(`audio${btn}`).pause();
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);
