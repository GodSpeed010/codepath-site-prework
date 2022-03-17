//Global Constants
const clueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
//randomly generated array of size 6 with integers from 1 to 5 (inclusive)
var pattern = Array(6)
  .fill()
  .map(() => Math.floor(5 * Math.random() + 1));
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;

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

async function setRandomCat(btn) {
  let response = await fetch('https://api.thecatapi.com/v1/images/search')
  var data = await response.json()
  console.log(data[0].url)
  let image_url = data[0].url
  
  document.getElementById("button" + btn).style.backgroundImage = `url(${image_url})`
  document.getElementById("button" + btn).style.backgroundSize = '90% 90%'
  document.getElementById("button" + btn).style.backgroundRepeat = 'no-repeat'
  document.getElementById("button" + btn).style.backgroundPosition = 'center'
}

function guess(btn) {
  setRandomCat(btn)
  
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
    loseGame();
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
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
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
