import { Connect4Board, TTTBoard, RPSChoice, WinState } from '../types/game';

export const C4_ROWS = 6;
export const C4_COLS = 7;

// Connect Four Logic
export function createEmptyConnect4Board(): Connect4Board {
  return Array.from({ length: C4_ROWS }, () => Array(C4_COLS).fill(0));
}

export function getLowestEmptyRow(board: Connect4Board, col: number): number {
  if (col < 0 || col >= C4_COLS) return -1;
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }
  return -1;
}

export function checkConnect4Win(board: Connect4Board): WinState {
  // Check horizontal
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const p = board[r][c];
      if (p !== 0 && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
        return {
          winner: p === 1 ? 'player1' : 'player2',
          winningCells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]],
        };
      }
    }
  }

  // Check vertical
  for (let c = 0; c < C4_COLS; c++) {
    for (let r = 0; r <= C4_ROWS - 4; r++) {
      const p = board[r][c];
      if (p !== 0 && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
        return {
          winner: p === 1 ? 'player1' : 'player2',
          winningCells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]],
        };
      }
    }
  }

  // Check diagonal down-right
  for (let r = 0; r <= C4_ROWS - 4; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const p = board[r][c];
      if (p !== 0 && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) {
        return {
          winner: p === 1 ? 'player1' : 'player2',
          winningCells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]],
        };
      }
    }
  }

  // Check diagonal up-right
  for (let r = 3; r < C4_ROWS; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const p = board[r][c];
      if (p !== 0 && p === board[r - 1][c + 1] && p === board[r - 2][c + 2] && p === board[r - 3][c + 3]) {
        return {
          winner: p === 1 ? 'player1' : 'player2',
          winningCells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]],
        };
      }
    }
  }

  // Check draw (if row 0 is completely full)
  const isFull = board[0].every(cell => cell !== 0);
  if (isFull) {
    return { winner: 'draw' };
  }

  return { winner: null };
}

// Tic Tac Toe Logic
export function createEmptyTTTBoard(): TTTBoard {
  return Array(9).fill(null);
}

const TTT_WINNING_LINES = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal 1
  [2, 4, 6], // Diagonal 2
];

export function checkTTTWin(board: TTTBoard): WinState {
  for (const line of TTT_WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] === 'X' ? 'player1' : 'player2',
        winningLine: line,
      };
    }
  }

  if (board.every(cell => cell !== null)) {
    return { winner: 'draw' };
  }

  return { winner: null };
}

// Rock Paper Scissors Logic
export function evaluateRPSRound(p1: RPSChoice, p2: RPSChoice): 'player1' | 'player2' | 'draw' | null {
  if (!p1 || !p2) return null;
  if (p1 === p2) return 'draw';

  if (
    (p1 === 'rock' && p2 === 'scissors') ||
    (p1 === 'paper' && p2 === 'rock') ||
    (p1 === 'scissors' && p2 === 'paper')
  ) {
    return 'player1';
  }

  return 'player2';
}
