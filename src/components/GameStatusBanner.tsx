import React from 'react';
import { RotateCcw, Undo2, Trophy, Flame, AlertCircle } from 'lucide-react';
import { WinState, PlayerInfo, GameMode } from '../types/game';

interface GameStatusBannerProps {
  winState: WinState;
  currentTurn: 'player1' | 'player2';
  player1: PlayerInfo;
  player2: PlayerInfo | null;
  gameMode: GameMode;
  onRestart: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  myRole: string;
}

export const GameStatusBanner: React.FC<GameStatusBannerProps> = ({
  winState,
  currentTurn,
  player1,
  player2,
  gameMode,
  onRestart,
  onUndo,
  canUndo,
  myRole,
}) => {
  const isGameOver = winState.winner !== null;
  const winnerPlayer =
    winState.winner === 'player1'
      ? player1
      : winState.winner === 'player2'
      ? player2
      : null;

  return (
    <div className="w-full max-w-xl mx-auto mb-4">
      <div
        className={`rounded-2xl p-3 sm:p-4 border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg ${
          isGameOver
            ? winState.winner === 'draw'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : winState.winner === 'player1'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-rose-950/30'
              : 'bg-yellow-950/40 border-amber-400/40 text-yellow-200 shadow-amber-950/30'
            : 'bg-slate-900/60 border-slate-800 text-slate-200'
        }`}
      >
        {/* Status text */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          {isGameOver ? (
            winState.winner === 'draw' ? (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 animate-bounce">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            )
          ) : (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                currentTurn === 'player1'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-400/20 text-amber-400'
              }`}
            >
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
          )}

          <div>
            <div className="font-black text-base sm:text-lg flex items-center gap-2 justify-center sm:justify-start">
              {isGameOver ? (
                winState.winner === 'draw' ? (
                  <span>Match Drawn! It's a Tie</span>
                ) : (
                  <span>{winnerPlayer?.name || 'Player'} Wins! 🎉</span>
                )
              ) : (
                <span>
                  {currentTurn === 'player1' ? player1.name : player2?.name || 'Player 2'}'s Turn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isGameOver
                ? 'Ready for another round? Hit rematch below!'
                : gameMode === 'online'
                ? myRole === currentTurn
                  ? 'Make your move!'
                  : 'Waiting for opponent...'
                : 'Click or tap on the board to place your token'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {canUndo && onUndo && (
            <button
              onClick={onUndo}
              title="Undo last move"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isGameOver
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-indigo-600/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isGameOver ? 'Rematch / Play Again' : 'Restart Game'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
