import React, { useState, useEffect, useRef } from 'react';
import { Connect4Board, WinState } from '../types/game';
import { C4_COLS, C4_ROWS, getLowestEmptyRow } from '../utils/gameLogic';
import { ArrowDown, CornerDownLeft, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ConnectFourBoardProps {
  board: Connect4Board;
  currentTurn: 'player1' | 'player2';
  winState: WinState;
  onDropDisc: (col: number) => void;
  isInteractive: boolean;
}

export const ConnectFourBoard: React.FC<ConnectFourBoardProps> = ({
  board,
  currentTurn,
  winState,
  onDropDisc,
  isInteractive,
}) => {
  // Column focus for keyboard & mouse navigation
  const [focusedCol, setFocusedCol] = useState<number>(3); // start at center column
  const [isKeyboardActive, setIsKeyboardActive] = useState<boolean>(false);
  const [fullColError, setFullColError] = useState<number | null>(null);
  const colRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Check if cell is part of winning 4
  const isWinningCell = (row: number, col: number): boolean => {
    if (!winState.winningCells) return false;
    return winState.winningCells.some(([r, c]) => r === row && c === col);
  };

  const isColFull = (col: number): boolean => {
    return board[0][col] !== 0;
  };

  const getEmptySlotsCount = (col: number): number => {
    let count = 0;
    for (let r = 0; r < C4_ROWS; r++) {
      if (board[r][col] === 0) count++;
    }
    return count;
  };

  const handleDrop = (col: number) => {
    if (!isInteractive || winState.winner !== null) return;
    if (isColFull(col)) {
      sounds.playInvalid();
      setFullColError(col);
      setTimeout(() => setFullColError(null), 800);
      return;
    }
    onDropDisc(col);
  };

  // Keyboard navigation & accessibility event listener
  useEffect(() => {
    if (!isInteractive || winState.winner !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;

      // Number keys 1-7 (top row)
      if (/^[1-7]$/.test(key)) {
        e.preventDefault();
        setIsKeyboardActive(true);
        const col = parseInt(key, 10) - 1;
        setFocusedCol(col);
        handleDrop(col);
        return;
      }

      // Numpad 1-7
      if (key.startsWith('Numpad') && /^[1-7]$/.test(key.replace('Numpad', ''))) {
        e.preventDefault();
        setIsKeyboardActive(true);
        const col = parseInt(key.replace('Numpad', ''), 10) - 1;
        setFocusedCol(col);
        handleDrop(col);
        return;
      }

      // Left Navigation: ArrowLeft, 'a', 'A', 'h', 'H'
      if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'h' || key === 'H') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setFocusedCol(prev => (prev > 0 ? prev - 1 : C4_COLS - 1)); // wrap-around navigation
        return;
      }

      // Right Navigation: ArrowRight, 'd', 'D', 'l', 'L'
      if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'l' || key === 'L') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setFocusedCol(prev => (prev < C4_COLS - 1 ? prev + 1 : 0)); // wrap-around navigation
        return;
      }

      // Home & End keys
      if (key === 'Home') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setFocusedCol(0);
        return;
      }
      if (key === 'End') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setFocusedCol(C4_COLS - 1);
        return;
      }

      // Drop Disc: Enter, Space, ArrowDown, 's', 'S', 'j', 'J'
      if (
        key === 'Enter' ||
        key === ' ' ||
        key === 'ArrowDown' ||
        key === 's' ||
        key === 'S' ||
        key === 'j' ||
        key === 'J'
      ) {
        e.preventDefault();
        setIsKeyboardActive(true);
        handleDrop(focusedCol);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCol, isInteractive, winState.winner, board]);

  const activeColor = currentTurn === 'player1' ? 'bg-rose-500' : 'bg-amber-400';
  const activeRing = currentTurn === 'player1' ? 'ring-rose-400' : 'ring-amber-400';
  const emptySlotsInFocused = getEmptySlotsCount(focusedCol);

  return (
    <div
      className="flex flex-col items-center select-none w-full max-w-xl mx-auto focus:outline-none"
      role="region"
      aria-label="Connect Four Interactive Board"
      tabIndex={0}
      onFocus={() => setIsKeyboardActive(true)}
    >
      {/* Screen Reader ARIA Live Status Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {winState.winner
          ? `Game Over. Winner: ${winState.winner}`
          : `Column ${focusedCol + 1} selected. ${emptySlotsInFocused} empty slots remaining. Press Space or Enter to drop.`}
      </div>

      {/* Top Preview Zone & Column Selector Badges */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full px-4 sm:px-6 h-12 sm:h-14 items-center mb-1">
        {Array.from({ length: C4_COLS }).map((_, col) => {
          const isSelected = focusedCol === col;
          const full = isColFull(col);
          const showGhost = isSelected && !full && isInteractive && winState.winner === null;
          const isError = fullColError === col;

          return (
            <div key={`ghost_${col}`} className="flex flex-col justify-center items-center h-full">
              {showGhost ? (
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${activeColor} opacity-85 shadow-lg transform scale-100 flex flex-col items-center justify-center transition-all animate-bounce ring-2 ring-white/70`}
                >
                  <ArrowDown className="w-4 h-4 text-slate-950 font-black stroke-[3]" />
                </div>
              ) : isError ? (
                <div className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded border border-rose-500/60 animate-shake">
                  FULL
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFocusedCol(col);
                    setIsKeyboardActive(false);
                    handleDrop(col);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-700 text-white ring-2 ring-slate-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                  aria-label={`Select column ${col + 1}`}
                >
                  {col + 1}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Connect Four Board Frame */}
      <div
        className="relative bg-gradient-to-b from-blue-700 via-indigo-800 to-blue-950 p-3 sm:p-4 rounded-3xl shadow-2xl shadow-blue-950/80 border-4 border-blue-600/60 ring-2 ring-blue-400/20 w-full"
        role="grid"
        aria-label="Connect 4 Grid: 7 columns by 6 rows"
      >
        {/* Subtle corner rivets */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-300/40" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-300/40" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-blue-300/40" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-blue-300/40" />

        {/* 7 Columns Container */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3.5 bg-blue-900/60 p-2 sm:p-3 rounded-2xl border border-blue-500/30">
          {Array.from({ length: C4_COLS }).map((_, col) => {
            const full = isColFull(col);
            const isColFocused = focusedCol === col;
            const canClick = isInteractive && !full && winState.winner === null;
            const isError = fullColError === col;

            return (
              <button
                key={`col_${col}`}
                ref={el => {
                  colRefs.current[col] = el;
                }}
                onClick={() => {
                  setFocusedCol(col);
                  setIsKeyboardActive(false);
                  handleDrop(col);
                }}
                onMouseEnter={() => {
                  setFocusedCol(col);
                  setIsKeyboardActive(false);
                }}
                disabled={!isInteractive || winState.winner !== null}
                tabIndex={isColFocused ? 0 : -1}
                role="columnheader"
                aria-label={`Column ${col + 1} of ${C4_COLS}, ${getEmptySlotsCount(col)} slots open`}
                className={`relative flex flex-col gap-2 sm:gap-3.5 focus:outline-none rounded-xl p-1 transition-all ${
                  isColFocused && winState.winner === null
                    ? 'bg-blue-400/15 ring-2 ring-blue-300/60 shadow-lg shadow-blue-500/10'
                    : 'hover:bg-white/5'
                } ${isError ? 'animate-shake bg-rose-500/20' : ''} ${
                  canClick ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                }`}
              >
                {/* Visual focus column beam */}
                {isColFocused && winState.winner === null && (
                  <div className="absolute inset-0 pointer-events-none rounded-xl border border-blue-400/30 bg-gradient-to-b from-blue-300/10 to-transparent" />
                )}

                {/* 6 Rows per column (row 0 at top, row 5 at bottom) */}
                {Array.from({ length: C4_ROWS }).map((_, row) => {
                  const cell = board[row][col];
                  const isWinning = isWinningCell(row, col);

                  return (
                    <div
                      key={`cell_${row}_${col}`}
                      role="gridcell"
                      aria-label={`Row ${row + 1}, ${cell === 1 ? 'Player 1' : cell === 2 ? 'Player 2' : 'Empty'}`}
                      className="relative w-8 h-8 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center"
                    >
                      {/* Empty Hole Cutout shadow */}
                      <div className="absolute inset-0 rounded-full bg-slate-950/80 shadow-inner border border-blue-950/90" />

                      {/* Disc inside cell */}
                      {cell === 1 && (
                        <div
                          className={`relative z-10 w-full h-full rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 shadow-md flex items-center justify-center animate-drop-disc ${
                            isWinning ? 'animate-win-disc ring-4 ring-amber-300 z-20' : ''
                          }`}
                        >
                          <div className="w-1/2 h-1/2 rounded-full border border-rose-300/50" />
                        </div>
                      )}

                      {cell === 2 && (
                        <div
                          className={`relative z-10 w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-md flex items-center justify-center animate-drop-disc ${
                            isWinning ? 'animate-win-disc ring-4 ring-amber-200 z-20' : ''
                          }`}
                        >
                          <div className="w-1/2 h-1/2 rounded-full border border-yellow-200/50" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </button>
            );
          })}
        </div>

        {/* Board base legs */}
        <div className="flex justify-between items-center -mb-7 px-4">
          <div className="w-12 sm:w-16 h-4 bg-blue-950 rounded-b-xl border-b border-x border-blue-700/60" />
          <div className="w-12 sm:w-16 h-4 bg-blue-950 rounded-b-xl border-b border-x border-blue-700/60" />
        </div>
      </div>

      {/* Interactive Keyboard Shortcuts Toolbar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-800">
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Keyboard Nav:
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            →
          </kbd>
          <span>Move</span>
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm flex items-center gap-0.5">
            <CornerDownLeft className="w-3 h-3 inline" /> Enter
          </kbd>
          <span className="text-slate-500">or</span>
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            Space
          </kbd>
          <span>Drop</span>
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            1
          </kbd>
          <span className="text-slate-500">-</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            7
          </kbd>
          <span>Quick Drop</span>
        </span>
      </div>
    </div>
  );
};
