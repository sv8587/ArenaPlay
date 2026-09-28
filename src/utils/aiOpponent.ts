import { Connect4Board, TTTBoard, AIDifficulty } from '../types/game';
import { C4_COLS, C4_ROWS, getLowestEmptyRow, checkConnect4Win, checkTTTWin } from './gameLogic';

// Tic Tac Toe AI
export function getTTTAIMove(board: TTTBoard, difficulty: AIDifficulty): number {
  const emptyIndices: number[] = [];
  board.forEach((val, idx) => {
    if (val === null) emptyIndices.push(idx);
  });

  if (emptyIndices.length === 0) return -1;

  if (difficulty === 'easy') {
    // 30% chance to check winning move, otherwise random
    if (Math.random() < 0.3) {
      const winMove = findTTTWinningMove(board, 'O');
      if (winMove !== -1) return winMove;
    }
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (difficulty === 'medium') {
    // Always take win if available
    const winMove = findTTTWinningMove(board, 'O');
    if (winMove !== -1) return winMove;

    // 70% chance to block player's win
    if (Math.random() < 0.7) {
      const blockMove = findTTTWinningMove(board, 'X');
      if (blockMove !== -1) return blockMove;
    }

    // Prefer center
    if (board[4] === null && Math.random() < 0.6) return 4;

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Hard: Perfect Minimax
  let bestScore = -Infinity;
  let bestMove = emptyIndices[0];

  for (const idx of emptyIndices) {
    board[idx] = 'O';
    const score = minimaxTTT(board, 0, false);
    board[idx] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }

  return bestMove;
}

function findTTTWinningMove(board: TTTBoard, symbol: 'X' | 'O'): number {
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = symbol;
      const win = checkTTTWin(board);
      board[i] = null;
      if (win.winner !== null && win.winner !== 'draw') {
        return i;
      }
    }
  }
  return -1;
}

function minimaxTTT(board: TTTBoard, depth: number, isMaximizing: boolean): number {
  const win = checkTTTWin(board);
  if (win.winner === 'player2') return 10 - depth; // AI is player2 (O)
  if (win.winner === 'player1') return depth - 10; // Human is player1 (X)
  if (win.winner === 'draw') return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const evalScore = minimaxTTT(board, depth + 1, false);
        board[i] = null;
        maxEval = Math.max(maxEval, evalScore);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const evalScore = minimaxTTT(board, depth + 1, true);
        board[i] = null;
        minEval = Math.min(minEval, evalScore);
      }
    }
    return minEval;
  }
}

// Connect Four AI
export function getConnect4AIMove(board: Connect4Board, difficulty: AIDifficulty): number {
  const validCols: number[] = [];
  for (let c = 0; c < C4_COLS; c++) {
    if (board[0][c] === 0) validCols.push(c);
  }

  if (validCols.length === 0) return 3;

  // 1. Always check if AI (player 2) can win in 1 move
  for (const c of validCols) {
    const r = getLowestEmptyRow(board, c);
    board[r][c] = 2;
    const win = checkConnect4Win(board);
    board[r][c] = 0;
    if (win.winner === 'player2') return c;
  }

  // 2. Always block if Player 1 can win in 1 move (except on easy where it might miss)
  const blockProbability = difficulty === 'easy' ? 0.35 : difficulty === 'medium' ? 0.8 : 1.0;
  if (Math.random() < blockProbability) {
    for (const c of validCols) {
      const r = getLowestEmptyRow(board, c);
      board[r][c] = 1;
      const win = checkConnect4Win(board);
      board[r][c] = 0;
      if (win.winner === 'player1') return c;
    }
  }

  if (difficulty === 'easy') {
    // Pick random column, lightly favoring center
    const weighted = [...validCols];
    if (validCols.includes(3)) weighted.push(3, 3);
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  const depth = difficulty === 'medium' ? 3 : 5;
  let bestScore = -Infinity;
  // Order columns from center outwards for faster alpha-beta cutoff: [3, 2, 4, 1, 5, 0, 6]
  const columnOrder = [3, 2, 4, 1, 5, 0, 6].filter(c => validCols.includes(c));
  let bestCol = columnOrder[0];

  for (const c of columnOrder) {
    const r = getLowestEmptyRow(board, c);
    board[r][c] = 2;
    const score = minimaxC4(board, depth - 1, -Infinity, Infinity, false);
    board[r][c] = 0;

    if (score > bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }

  return bestCol;
}

function minimaxC4(
  board: Connect4Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  const win = checkConnect4Win(board);
  if (win.winner === 'player2') return 100000 + depth;
  if (win.winner === 'player1') return -100000 - depth;
  if (win.winner === 'draw') return 0;
  if (depth === 0) return evaluateC4Position(board);

  const columnOrder = [3, 2, 4, 1, 5, 0, 6];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const c of columnOrder) {
      const r = getLowestEmptyRow(board, c);
      if (r === -1) continue;

      board[r][c] = 2;
      const evalScore = minimaxC4(board, depth - 1, alpha, beta, false);
      board[r][c] = 0;

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const c of columnOrder) {
      const r = getLowestEmptyRow(board, c);
      if (r === -1) continue;

      board[r][c] = 1;
      const evalScore = minimaxC4(board, depth - 1, alpha, beta, true);
      board[r][c] = 0;

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Heuristic score for Connect 4 position
function evaluateC4Position(board: Connect4Board): number {
  let score = 0;

  // Center column preference
  const centerCol = 3;
  let centerCount = 0;
  for (let r = 0; r < C4_ROWS; r++) {
    if (board[r][centerCol] === 2) centerCount++;
    else if (board[r][centerCol] === 1) centerCount--;
  }
  score += centerCount * 6;

  // Window evaluation (4-cell windows)
  // Horizontal
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += scoreWindow(window);
    }
  }

  // Vertical
  for (let c = 0; c < C4_COLS; c++) {
    for (let r = 0; r <= C4_ROWS - 4; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += scoreWindow(window);
    }
  }

  // Positive diagonal
  for (let r = 0; r <= C4_ROWS - 4; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += scoreWindow(window);
    }
  }

  // Negative diagonal
  for (let r = 3; r < C4_ROWS; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += scoreWindow(window);
    }
  }

  return score;
}

function scoreWindow(window: number[]): number {
  let score = 0;
  const count2 = window.filter(x => x === 2).length;
  const count1 = window.filter(x => x === 1).length;
  const countEmpty = window.filter(x => x === 0).length;

  if (count2 === 4) return 1000;
  if (count2 === 3 && countEmpty === 1) score += 15;
  if (count2 === 2 && countEmpty === 2) score += 4;

  if (count1 === 3 && countEmpty === 1) score -= 80; // Prioritize blocking 3
  if (count1 === 2 && countEmpty === 2) score -= 5;

  return score;
}
