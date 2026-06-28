/**
 * ai.js
 * ------
 * The AI "brain" — Minimax with Alpha-Beta Pruning.
 * Pure logic, no DOM access here. This mirrors the same separation
 * of concerns as game.py in the Python version of this project:
 * the AI doesn't know or care how the board is drawn on screen.
 *
 * Board representation: a flat array of 9 cells, indices 0-8,
 * laid out like a phone keypad:
 *   0 | 1 | 2
 *   3 | 4 | 5
 *   6 | 7 | 8
 * Each cell is "X" (human), "O" (AI), or null (empty).
 */

const HUMAN = "X";
const AI = "O";

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

/** Returns "X", "O", or null if there's no winner yet. */
function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/** Returns the winning line (array of 3 indices) or null. */
function getWinningLine(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

/**
 * Core Minimax search with Alpha-Beta Pruning.
 *
 * @param {Array} board - current board state
 * @param {number} depth - how many moves deep we are (used to prefer faster wins)
 * @param {boolean} isMaximizing - true when it's the AI's turn to move in this branch
 * @param {number} alpha - best score the maximizer can guarantee so far
 * @param {number} beta - best score the minimizer can guarantee so far
 * @returns {number} the score of this board state from the AI's perspective
 */
function minimax(board, depth, isMaximizing, alpha, beta) {
  const winner = getWinner(board);
  if (winner === AI) return 10 - depth;
  if (winner === HUMAN) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = AI;
      const score = minimax(board, depth + 1, false, alpha, beta);
      board[move] = null;
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break; // prune
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = HUMAN;
      const score = minimax(board, depth + 1, true, alpha, beta);
      board[move] = null;
      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (beta <= alpha) break; // prune
    }
    return best;
  }
}

/** Picks the optimal move for the AI using full Minimax + Alpha-Beta. */
function getBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of getAvailableMoves(board)) {
    board[move] = AI;
    const score = minimax(board, 0, false, -Infinity, Infinity);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

/** Picks a uniformly random legal move (used for "easy" difficulty). */
function getRandomMove(board) {
  const moves = getAvailableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Returns the AI's chosen move given a difficulty setting.
 *   "easy"   -> always random
 *   "medium" -> optimal ~70% of the time, random ~30% of the time
 *   "hard"   -> always optimal (unbeatable)
 */
function getAIMove(board, difficulty) {
  if (difficulty === "easy") {
    return getRandomMove(board);
  }
  if (difficulty === "medium" && Math.random() < 0.3) {
    return getRandomMove(board);
  }
  return getBestMove(board);
}
