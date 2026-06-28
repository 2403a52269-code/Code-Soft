/**
 * script.js
 * ----------
 * UI controller. Handles DOM events, board rendering, and game flow.
 * All AI decision-making lives in ai.js — this file just calls into it.
 */

const board = Array(9).fill(null);
let difficulty = "hard";
let firstPlayer = "human";
let currentPlayer = "human";
let gameActive = false;

let scores = { human: 0, ai: 0, draw: 0 };
let aiMoveTimeoutId = null;

// ---- DOM references ----
const setupPanel = document.getElementById("setup-panel");
const gamePanel = document.getElementById("game-panel");
const difficultyRow = document.getElementById("difficulty-row");
const firstRow = document.getElementById("first-row");
const difficultyHint = document.getElementById("difficulty-hint");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");
const backToMenuBtn = document.getElementById("back-to-menu-btn");
const boardEl = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusPill = document.getElementById("status-pill");
const statusText = document.getElementById("status-text");
const winLine = document.getElementById("win-line");
const winLineShape = document.getElementById("win-line-shape");
const scoreHumanEl = document.getElementById("score-human");
const scoreAiEl = document.getElementById("score-ai");
const scoreDrawEl = document.getElementById("score-draw");
const resultOverlay = document.getElementById("result-overlay");
const resultEyebrow = document.getElementById("result-eyebrow");
const resultTitle = document.getElementById("result-title");
const playAgainBtn = document.getElementById("play-again-btn");

const DIFFICULTY_HINTS = {
  easy: "AI picks a random legal move every turn. Great for beginners.",
  medium: "AI plays well, but slips into a random move about 30% of the time.",
  hard: "Full Minimax + Alpha-Beta. Best you can do is draw.",
};

// ---- Setup panel interactions ----

difficultyRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".choice-btn");
  if (!btn) return;
  setActiveChoice(difficultyRow, btn);
  difficulty = btn.dataset.value;
  difficultyHint.textContent = DIFFICULTY_HINTS[difficulty];
});

firstRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".choice-btn");
  if (!btn) return;
  setActiveChoice(firstRow, btn);
  firstPlayer = btn.dataset.value;
});

function setActiveChoice(row, activeBtn) {
  row.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("is-active"));
  activeBtn.classList.add("is-active");
}

startBtn.addEventListener("click", () => {
  setupPanel.hidden = true;
  gamePanel.hidden = false;
  startNewRound();
});

restartBtn.addEventListener("click", startNewRound);
backBtn.addEventListener("click", returnToSetup);
backToMenuBtn.addEventListener("click", returnToSetup);
playAgainBtn.addEventListener("click", () => {
  resultOverlay.hidden = true;
  startNewRound();
});

// ---- Board interaction ----

boardEl.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  if (!gameActive || currentPlayer !== "human") return;

  const index = Number(cell.dataset.index);
  if (board[index] !== null) return;

  placeMark(index, HUMAN_SYMBOL());
  afterMove();
});

function HUMAN_SYMBOL() { return "X"; }
function AI_SYMBOL() { return "O"; }

// ---- Game flow ----

function startNewRound() {
  if (aiMoveTimeoutId !== null) {
    clearTimeout(aiMoveTimeoutId);
    aiMoveTimeoutId = null;
  }

  board.fill(null);
  gameActive = true;
  currentPlayer = firstPlayer;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.className = "cell";
  });
  winLine.classList.remove("show");

  updateStatus();

  if (currentPlayer === "ai") {
    triggerAIMove();
  }
}

function placeMark(index, symbol) {
  board[index] = symbol;
  const cell = cells[index];
  cell.textContent = symbol;
  cell.classList.add("filled", symbol === "X" ? "mark-x" : "mark-o", "pop");
}

function afterMove() {
  const winner = getWinner(board);
  const full = isBoardFull(board);

  if (winner || full) {
    endRound(winner);
    return;
  }

  currentPlayer = currentPlayer === "human" ? "ai" : "human";
  updateStatus();

  if (currentPlayer === "ai") {
    triggerAIMove();
  }
}

function triggerAIMove() {
  statusPill.classList.add("thinking");
  statusText.textContent = "AI is thinking…";

  // Small delay purely for UX — makes the "thinking" state feel real
  // rather than instant, even though the computation itself is fast.
  aiMoveTimeoutId = setTimeout(() => {
    aiMoveTimeoutId = null;
    const move = getAIMove(board, difficulty);
    placeMark(move, AI_SYMBOL());
    statusPill.classList.remove("thinking");
    afterMove();
  }, 450);
}

function updateStatus() {
  if (!gameActive) return;
  statusText.textContent = currentPlayer === "human" ? "Your move" : "AI is thinking…";
}

function endRound(winner) {
  gameActive = false;
  if (aiMoveTimeoutId !== null) {
    clearTimeout(aiMoveTimeoutId);
    aiMoveTimeoutId = null;
  }

  const line = getWinningLine(board);
  if (line) {
    line.forEach((i) => cells[i].classList.add("win-cell"));
    drawWinLine(line);
  }

  if (winner === HUMAN_SYMBOL()) {
    scores.human++;
    showResult("ROUND OVER", "You win", "win");
  } else if (winner === AI_SYMBOL()) {
    scores.ai++;
    showResult("ROUND OVER", "AI wins", "lose");
  } else {
    scores.draw++;
    showResult("ROUND OVER", "Draw", "draw");
  }

  scoreHumanEl.textContent = scores.human;
  scoreAiEl.textContent = scores.ai;
  scoreDrawEl.textContent = scores.draw;
}

function showResult(eyebrow, title, kind) {
  resultEyebrow.textContent = eyebrow;
  resultTitle.textContent = title;
  resultTitle.className = "result-title " + kind;
  // brief pause so the win-line animation is visible before the overlay appears
  setTimeout(() => { resultOverlay.hidden = false; }, 420);
}

function returnToSetup() {
  if (aiMoveTimeoutId !== null) {
    clearTimeout(aiMoveTimeoutId);
    aiMoveTimeoutId = null;
  }

  resultOverlay.hidden = true;
  gamePanel.hidden = true;
  setupPanel.hidden = false;
  gameActive = false;
  statusPill.classList.remove("thinking");
}

// ---- Win line drawing ----
// Maps a winning line of 3 cell indices to SVG coordinates, matching
// the 3x3 grid layout (300x300 viewBox, one cell = 100x100 minus gaps).

const CELL_CENTERS = [
  [50, 50], [150, 50], [250, 50],
  [50, 150], [150, 150], [250, 150],
  [50, 250], [150, 250], [250, 250],
];

function drawWinLine(line) {
  const [startIdx, , endIdx] = line;
  const [x1, y1] = CELL_CENTERS[startIdx];
  const [x2, y2] = CELL_CENTERS[endIdx];

  winLineShape.setAttribute("x1", x1);
  winLineShape.setAttribute("y1", y1);
  winLineShape.setAttribute("x2", x2);
  winLineShape.setAttribute("y2", y2);

  // restart animation cleanly
  winLine.classList.remove("show");
  void winLine.offsetWidth; // force reflow
  winLine.classList.add("show");
}
