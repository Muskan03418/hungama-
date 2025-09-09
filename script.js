const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const livesEl = document.getElementById("lives");
const questionEl = document.getElementById("question");
const maskedEl = document.getElementById("maskedWord");
const lettersWrap = document.getElementById("letters");
const statusEl = document.getElementById("status");
const newBtn = document.getElementById("newBtn");
const resetBtn = document.getElementById("resetBtn");

let questions = [];
let current = null;      // { Question, Answer }
let display = [];        // array of chars ('_' or actual)
let lives = 6;
let guessed = new Set();
let gameOver = false;

function normalize(s){ return s.normalize('NFKD'); }
function isAlpha(ch){ return /^[A-Z]$/i.test(ch); }

function renderLetters() {
  lettersWrap.innerHTML = "";
  LETTERS.forEach(ch => {
    const btn = document.createElement("button");
    btn.className = "letter";
    btn.textContent = ch;
    btn.disabled = guessed.has(ch) || gameOver;
    btn.addEventListener("click", () => onGuess(ch));
    lettersWrap.appendChild(btn);
  });
}

function pickRandomQuestion() {
  if (!questions.length) return;
  current = questions[Math.floor(Math.random()*questions.length)];
  setupRound();
}

function setupRound() {
  lives = 6; gameOver = false; guessed.clear(); statusEl.textContent = "";
  const ans = normalize(current.Answer);
  display = Array.from(ans).map(ch => isAlpha(ch) ? '_' : ch);
  questionEl.textContent = current.Question;
  maskedEl.textContent = display.join(' ');
  livesEl.textContent = lives;
  renderLetters();
}

function onGuess(letter) {
  if (gameOver) return;
  guessed.add(letter);
  const ans = normalize(current.Answer);
  const upperAns = ans.toUpperCase();

  let hit = false;
  for (let i = 0; i < ans.length; i++) {
    if (isAlpha(ans[i]) && upperAns[i] === letter) {
      display[i] = ans[i]; // preserve original case if any
      hit = true;
    }
  }

  if (!hit) {
    lives--;
    livesEl.textContent = lives;
    statusEl.innerHTML = `<span class="bad">Wrong guess!</span> "${letter}" not found.`;
  } else {
    statusEl.innerHTML = `<span class="ok">Correct!</span> "${letter}" found.`;
  }

  maskedEl.textContent = display.join(' ');
  renderLetters();
  checkEnd();
}

function checkEnd() {
  if (!display.includes('_')) {
    gameOver = true;
    statusEl.innerHTML = `🎉 You Won! Answer is: <b>${current.Answer}</b>`;
    renderLetters();
  } else if (lives <= 0) {
    gameOver = true;
    statusEl.innerHTML = `💀 Game over! Answer is: <b>${current.Answer}</b>`;
    maskedEl.textContent = current.Answer.split('').join(' ');
    renderLetters();
  }
}

newBtn.addEventListener("click", pickRandomQuestion);
resetBtn.addEventListener("click", () => setupRound());

async function loadQuestions() {
  try {
    const res = await fetch("./questions.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    questions = await res.json();
    pickRandomQuestion();
  } catch (err) {
    questionEl.textContent = "Questions load error";
    console.error(err);
  }
}

loadQuestions();
