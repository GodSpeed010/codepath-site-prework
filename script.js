//Global Constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence
const maxMistakes = 2;
const buttonCount = 5;

//Global Variables
var clueHoldTime = 1000; //how long to hold each clue's light/sound

//randomly generated array of size 6 with integers from 1 to 5 (inclusive)
var isDarkMode = false;
let isAccessibilityMode = false;
var pattern = Array(6)
  .fill()
  .map(() => Math.floor(5 * Math.random() + 1));
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;
var mistakesCount = 0;

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  mistakesCount = 0;

  //set the number of lives remaining
  updateLivesLeft();

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
  let winMessage = "Game Over. You won!";

  if (isAccessibilityMode) {
    speakMessage(winMessage);
  } else {
    alert(winMessage);
  }
}

function loseGame() {
  stopGame();
  let loseMessage = "Game Over. You lost.";

  if (isAccessibilityMode) {
    speakMessage(loseMessage);
  } else {
    alert(loseMessage);
  }
}

async function updateLivesLeft() {
  let livesLeft = maxMistakes - mistakesCount + 1;
  document.getElementById("livesLeft").innerHTML = `${livesLeft} lives left`;

  //loop for livesleft and set make sure not hidden
  for (let i = 1; i <= livesLeft; i++) {
    document.getElementById(`heart${i}`).classList.remove("hidden");
  }

  //hide as many hearts as value of mistakesCount. Start iterating from end because prev loop started unhiding from start.
  for (let i = 0; i < mistakesCount; i++) {
    document
      .getElementById(`heart${maxMistakes - i + 1}`)
      .classList.add("hidden");
    console.log(`hiding heart ${maxMistakes - i}`);
  }

  //tell user how many lives left if Accessibility Mode is enabled
  if (isAccessibilityMode) {
    speakMessage(`${livesLeft} lives left`);
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
      mistakesCount++;
      updateLivesLeft();

      loseGame();
    } else {
      mistakesCount++;
      updateLivesLeft();
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

function toggleDarkMode() {
  toggleDarkModeSwitch();

  //set body to dark mode
  document.body.classList.toggle("dark-mode");
}

function toggleDarkModeSwitch() {
  //toggle the switch
  if (isDarkMode) {
    document.getElementById("basic-switch").className =
      "mdc-switch mdc-switch--unselected";
    isDarkMode = !isDarkMode;
  } else {
    document.getElementById("basic-switch").className =
      "mdc-switch mdc-switch--selected";
    isDarkMode = !isDarkMode;
  }
}

function toggleAccessibilityMode() {
  //toggle the switch
  if (isAccessibilityMode) {
    document.getElementById("basic-switch2").className =
      "mdc-switch mdc-switch--unselected";
    isAccessibilityMode = !isAccessibilityMode;
  } else {
    document.getElementById("basic-switch2").className =
      "mdc-switch mdc-switch--selected";
    isAccessibilityMode = !isAccessibilityMode;

    // Give the document focus
    window.focus();

    // Remove focus from any focused element
    if (document.activeElement) {
      document.activeElement.blur();
    }

    //Play instruction message
    var msg = new SpeechSynthesisUtterance(
      "To win the game, repeat back the pattern by pressing the keyboard number associated with the sound. " +
        "The number associated with each sound will be played once after this message. " +
        "Press R to replay it at any time. " +
        "After the following message, press enter to start playing. "
    );
    msg.lang = "en-US";
    window.speechSynthesis.speak(msg);

    msg.onend = function () {
      playNumToSoundSequence();
    };
  }
}

document.addEventListener("keydown", function (event) {
  let rKeyCode = 82;
  let enterKeyCode = 13;

  let minNumKeyCode = 49; //keyCode for 1
  let maxNumKeyCode = 53; //keyCode for 5

  if (isAccessibilityMode) {
    if (event.keyCode == rKeyCode) {
      console.log("R pressed");
      playNumToSoundSequence();
    } else if (event.keyCode == enterKeyCode) {
      console.log("Enter pressed");
      //use enter key to start/stop game
      if (gamePlaying) {
        stopGame();
      } else {
        startGame();
      }
    } else if (
      event.keyCode >= minNumKeyCode &&
      event.keyCode <= maxNumKeyCode
    ) {
      //guess button using keyboard keys

      let numPressed = Math.abs(event.keyCode - minNumKeyCode) + 1;
      console.log("pressed " + numPressed);

      keyBoardGuess(numPressed);
    }
  }
});

async function keyBoardGuess(numPressed) {
  guess(numPressed);
  playTone(numPressed, 500);
}

async function playNumToSoundSequence() {
  for (let btn = 1; btn <= buttonCount; btn++) {
    //say which button sound is about to be played
    speakMessage(`Button ${btn}`);

    await sleep(1000);
    playBtnClue(btn);
    await sleep(2000);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function playBtnClue(btn) {
  //Play button sound
  lightButton(btn);
  playTone(btn, clueHoldTime);
  setTimeout(clearButton, clueHoldTime, btn);
}

function speakMessage(msg) {
  var msg = new SpeechSynthesisUtterance(msg);
  msg.lang = "en-US";
  window.speechSynthesis.speak(msg);
}
