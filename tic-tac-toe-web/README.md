# Tic-Tac-Toe AI — HTML / CSS / JS version 🤖

An unbeatable Tic-Tac-Toe AI you play in the browser, built with **Minimax + Alpha-Beta Pruning**.
No build tools, no npm install, no frameworks — just open it and play.

## Folder structure

```
tic-tac-toe-web/
├── index.html     # Page structure (the board, setup screen, scoreboard)
├── style.css      # All visual styling
├── ai.js          # The AI brain — Minimax + Alpha-Beta logic (pure logic, no DOM code)
├── script.js      # UI controller — handles clicks, renders the board, calls into ai.js
└── README.md       # This file
```

Same separation-of-concerns idea as a typical clean project: the AI's
"thinking" (`ai.js`) is completely separate from the page's "interface"
(`script.js` + `index.html` + `style.css`), so each file has one job.

## How to run it in VS Code with Live Server

1. Open this folder in VS Code: `File > Open Folder...` → select `tic-tac-toe-web`.
2. If you don't already have it, install the **Live Server** extension:
   - Click the Extensions icon in the left sidebar (or `Ctrl+Shift+X`)
   - Search for `Live Server` (by Ritwick Dey)
   - Click **Install**
3. In the file explorer, right-click `index.html`.
4. Click **"Open with Live Server"**.
5. Your browser will open automatically at something like `http://127.0.0.1:5500` — the game is now running.

Any time you edit `style.css`, `script.js`, or `ai.js` and save, Live Server
auto-refreshes the page for you.

> No Live Server installed and don't want to install it? You can also just
> double-click `index.html` to open it directly in any browser — the game
> works the same either way. Live Server is only needed if you want
> auto-reload while editing.

## How to play

1. Pick a difficulty:
   - **Easy** — AI moves completely at random
   - **Medium** — AI plays well, but slips into a random move ~30% of the time
   - **Hard** — full Minimax + Alpha-Beta, truly unbeatable
2. Pick who goes first — you or the AI.
3. Click **Start match**.
4. Click any empty cell to place your mark. The AI responds automatically.
5. The scoreboard at the bottom tracks wins/losses/draws across rounds —
   click **Play again** or **Restart** to keep going.

## How the AI works

- **Minimax** simulates every possible sequence of future moves from the
  current board, assuming both players always play their best move. It
  scores each final outcome from the AI's point of view (+10 for an AI
  win, -10 for a human win, 0 for a draw, both adjusted slightly by depth
  so the AI prefers winning sooner and losing later) and walks back up the
  tree picking the move that leads to the best guaranteed result.
- **Alpha-Beta Pruning** speeds this up: while exploring moves, it tracks
  the best score the maximizer (AI) and minimizer (human) have found so
  far, and stops exploring any branch that can't possibly beat what's
  already been found. Same final decision, less wasted computation.

This logic lives entirely in `ai.js` and is identical in spirit to a
Python implementation of the same algorithm — only the syntax differs.

## Ideas if you want to extend it

- Add sound effects on move/win using the Web Audio API.
- Persist scores across page reloads with `localStorage`.
- Add a "show AI's thinking" mode that highlights cells being evaluated.
- Generalize to a 4x4 board (great way to *feel* why Alpha-Beta Pruning matters,
  since the search space grows fast).
