import React, { useState, useEffect, useRef } from 'react';
import { TTTBoard, WinState } from '../types/game';
import { CornerDownLeft, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TicTacToeBoardProps {
  board: TTTBoard;
  currentTurn: 'player1' | 'player2';
  winState: WinState;
  onSelectCell: (index: number) => void;
  isInteractive: boolean;
}

export const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  board,
  currentTurn,
  winState,
  onSelectCell,
  isInteractive,
}) => {
  // Focus index 0..8 for 2D grid keyboard navigation (default center cell 4)
  const [focusedIndex, setFocusedIndex] = useState<number>(4);
  const [isKeyboardActive, setIsKeyboardActive] = useState<boolean>(false);
  const [lastPlacedIndex, setLastPlacedIndex] = useState<number | null>(null);
  const prevBoardRef = useRef<TTTBoard>(board);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Detect newly placed pieces to trigger pop-in and tactile flicker
  useEffect(() => {
    const changedIdx = board.findIndex((cell, i) => prevBoardRef.current[i] === null && cell !== null);
    if (changedIdx !== -1) {
      setLastPlacedIndex(changedIdx);
      const timer = setTimeout(() => {
        setLastPlacedIndex(null);
      }, 600);
      prevBoardRef.current = board;
      return () => clearTimeout(timer);
    }
    prevBoardRef.current = board;
  }, [board]);

  const isWinningIndex = (idx: number): boolean => {
    return !!winState.winningLine?.includes(idx);
  };

  const handleMarkCell = (idx: number) => {
    if (!isInteractive || winState.winner !== null) return;
    if (board[idx] !== null) {
      sounds.playInvalid();
      return;
    }
    onSelectCell(idx);
  };

  // Keyboard navigation & accessibility event listener
  useEffect(() => {
    if (!isInteractive || winState.winner !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;

      // 1. Direct number keys 1-9 (phone/sequential layout)
      if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        setIsKeyboardActive(true);
        const idx = parseInt(key, 10) - 1;
        setFocusedIndex(idx);
        handleMarkCell(idx);
        return;
      }

      // 2. Numpad layout mapping (7 8 9 top, 4 5 6 middle, 1 2 3 bottom)
      const numpadMap: Record<string, number> = {
        Numpad7: 0,
        Numpad8: 1,
        Numpad9: 2,
        Numpad4: 3,
        Numpad5: 4,
        Numpad6: 5,
        Numpad1: 6,
        Numpad2: 7,
        Numpad3: 8,
      };

      if (key in numpadMap) {
        e.preventDefault();
        setIsKeyboardActive(true);
        const idx = numpadMap[key];
        setFocusedIndex(idx);
        handleMarkCell(idx);
        return;
      }

      const row = Math.floor(focusedIndex / 3);
      const col = focusedIndex % 3;

      // ArrowUp, 'w', 'W', 'k', 'K'
      if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'k' || key === 'K') {
        e.preventDefault();
        setIsKeyboardActive(true);
        const newRow = row > 0 ? row - 1 : 2; // wrap
        setFocusedIndex(newRow * 3 + col);
        return;
      }

      // ArrowDown, 's', 'S', 'j', 'J'
      if (key === 'ArrowDown' || key === 's' || key === 'S' || key === 'j' || key === 'J') {
        e.preventDefault();
        setIsKeyboardActive(true);
        const newRow = row < 2 ? row + 1 : 0; // wrap
        setFocusedIndex(newRow * 3 + col);
        return;
      }

      // ArrowLeft, 'a', 'A', 'h', 'H'
      if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'h' || key === 'H') {
        e.preventDefault();
        setIsKeyboardActive(true);
        const newCol = col > 0 ? col - 1 : 2; // wrap
        setFocusedIndex(row * 3 + newCol);
        return;
      }

      // ArrowRight, 'd', 'D', 'l', 'L'
      if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'l' || key === 'L') {
        e.preventDefault();
        setIsKeyboardActive(true);
        const newCol = col < 2 ? col + 1 : 0; // wrap
        setFocusedIndex(row * 3 + newCol);
        return;
      }

      // Home & End keys
      if (key === 'Home') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setFocusedIndex(0);
        return;
      }
      if (key === 'End') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setFocusedIndex(8);
        return;
      }

      // Space or Enter to mark cell
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        setIsKeyboardActive(true);
        handleMarkCell(focusedIndex);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, isInteractive, winState.winner, board]);

  const focusedRow = Math.floor(focusedIndex / 3);
  const focusedCol = focusedIndex % 3;
  const focusedOccupied = board[focusedIndex] !== null;

  return (
    <div
      className="flex flex-col items-center select-none w-full max-w-sm sm:max-w-md mx-auto focus:outline-none"
      role="region"
      aria-label="Tic-Tac-Toe Interactive Board"
      tabIndex={0}
      onFocus={() => setIsKeyboardActive(true)}
    >
      {/* Screen Reader ARIA Live Status Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {winState.winner
          ? `Game Over. Winner: ${winState.winner}`
          : `Selected Cell ${focusedIndex + 1}: Row ${focusedRow + 1}, Column ${focusedCol + 1}. ${
              focusedOccupied
                ? `Occupied by ${board[focusedIndex]}`
                : 'Empty. Press Space or Enter to mark.'
            }`}
      </div>

      <div
        className="relative p-4 sm:p-5 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl shadow-black/40 w-full"
        role="grid"
        aria-label="Tic-Tac-Toe 3x3 Grid"
      >
        {/* 3x3 Grid Container */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 p-2 bg-slate-950/60 rounded-2xl border border-slate-800/60">
          {board.map((cell, idx) => {
            const isWinning = isWinningIndex(idx);
            const isCellFocused = focusedIndex === idx;
            const isLastPlaced = lastPlacedIndex === idx;
            const canClick = isInteractive && cell === null && winState.winner === null;
            const r = Math.floor(idx / 3);
            const c = idx % 3;

            return (
              <button
                key={`ttt_cell_${idx}`}
                ref={el => {
                  cellRefs.current[idx] = el;
                }}
                onClick={() => {
                  setFocusedIndex(idx);
                  setIsKeyboardActive(false);
                  handleMarkCell(idx);
                }}
                onMouseEnter={() => {
                  setFocusedIndex(idx);
                  setIsKeyboardActive(false);
                }}
                disabled={!isInteractive || winState.winner !== null}
                tabIndex={isCellFocused ? 0 : -1}
                role="gridcell"
                aria-label={`Row ${r + 1}, Column ${c + 1}, ${cell ? `Marked ${cell}` : 'Empty'}`}
                className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 outline-none overflow-hidden ${
                  cell !== null
                    ? 'bg-slate-900/90 shadow-md border border-slate-700/50'
                    : canClick
                    ? 'bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 active:scale-95 cursor-pointer group'
                    : 'bg-slate-900/20 border border-slate-800/40 cursor-default'
                } ${
                  isWinning
                    ? 'ring-4 ring-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/30 z-10'
                    : isLastPlaced
                    ? `animate-cell-impact ring-2 ${cell === 'X' ? 'ring-rose-500/70 bg-rose-500/15 shadow-rose-500/30' : 'ring-amber-400/70 bg-amber-500/15 shadow-amber-400/30'} shadow-lg z-10`
                    : isCellFocused && winState.winner === null
                    ? 'ring-2 ring-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20 scale-[1.02] z-10 border-cyan-400/50'
                    : ''
                }`}
              >
                {/* Number hint in corner */}
                <span
                  className={`absolute top-2 left-2.5 text-[10px] font-mono transition-colors ${
                    isCellFocused
                      ? 'text-cyan-400 font-bold'
                      : cell === null
                      ? 'text-slate-600'
                      : 'text-slate-500'
                  }`}
                >
                  {idx + 1}
                </span>

                {/* X Symbol */}
                {cell === 'X' && (
                  <div className={`relative flex items-center justify-center ${isLastPlaced ? 'animate-piece-pop' : ''}`}>
                    {/* Subtle tactile glow halo when placed */}
                    {isLastPlaced && (
                      <div className="absolute inset-0 bg-rose-500/25 rounded-full blur-md animate-piece-flicker pointer-events-none" />
                    )}
                    <svg
                      className={`w-12 h-12 sm:w-16 sm:h-16 text-rose-500 drop-shadow-md relative z-10 ${
                        isWinning ? 'animate-pulse' : isLastPlaced ? 'animate-piece-flicker' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" className={isLastPlaced ? 'animate-draw-line-1' : ''} />
                      <line x1="6" y1="6" x2="18" y2="18" className={isLastPlaced ? 'animate-draw-line-2' : ''} />
                    </svg>
                  </div>
                )}

                {/* O Symbol */}
                {cell === 'O' && (
                  <div className={`relative flex items-center justify-center ${isLastPlaced ? 'animate-piece-pop' : ''}`}>
                    {/* Subtle tactile glow halo when placed */}
                    {isLastPlaced && (
                      <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-md animate-piece-flicker pointer-events-none" />
                    )}
                    <svg
                      className={`w-12 h-12 sm:w-16 sm:h-16 text-amber-400 drop-shadow-md relative z-10 ${
                        isWinning ? 'animate-pulse' : isLastPlaced ? 'animate-piece-flicker' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="8" className={isLastPlaced ? 'animate-draw-circle' : ''} />
                    </svg>
                  </div>
                )}

                {/* Active Focus Ghost Preview */}
                {cell === null && canClick && (
                  <div
                    className={`flex flex-col items-center justify-center transition-all ${
                      isCellFocused ? 'opacity-70 scale-100' : 'opacity-0 group-hover:opacity-30'
                    }`}
                  >
                    <span
                      className={`text-3xl sm:text-4xl font-black ${
                        currentTurn === 'player1' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {currentTurn === 'player1' ? 'X' : 'O'}
                    </span>
                    {isCellFocused && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 mt-1 hidden sm:block bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
                        SPACE / ENTER
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Keyboard Shortcuts Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-800">
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Grid Nav:
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            ↑
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            ↓
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            →
          </kbd>
          <span>Navigate</span>
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
          <span>Mark</span>
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            1
          </kbd>
          <span className="text-slate-500">-</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px] shadow-sm">
            9
          </kbd>
          <span>Quick Mark</span>
        </span>
      </div>
    </div>
  );
};
