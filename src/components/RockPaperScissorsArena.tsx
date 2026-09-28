import React, { useState, useEffect } from 'react';
import { RPSChoice, WinState } from '../types/game';
import { CheckCircle, Sparkles, CornerDownLeft } from 'lucide-react';

interface RockPaperScissorsArenaProps {
  currentTurn: 'player1' | 'player2';
  winState: WinState;
  p1Choice: RPSChoice;
  p2Choice: RPSChoice;
  revealed: boolean;
  history: any[];
  onChoose: (choice: RPSChoice) => void;
  isInteractive: boolean;
  myRole: string;
}

const choices: { id: RPSChoice; label: string; emoji: string; icon: string; beats: string; keyHint: string }[] = [
  { id: 'rock', label: 'Rock', emoji: '🪨', icon: '✊', beats: 'Scissors', keyHint: '1 / R' },
  { id: 'paper', label: 'Paper', emoji: '📄', icon: '✋', beats: 'Rock', keyHint: '2 / P' },
  { id: 'scissors', label: 'Scissors', emoji: '✂️', icon: '✌️', beats: 'Paper', keyHint: '3 / S' },
];

export const RockPaperScissorsArena: React.FC<RockPaperScissorsArenaProps> = ({
  currentTurn,
  winState,
  p1Choice,
  p2Choice,
  revealed,
  history,
  onChoose,
  isInteractive,
  myRole,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const lastRound = history.length > 0 ? history[history.length - 1] : null;

  // Keyboard navigation for RPS
  useEffect(() => {
    if (!isInteractive || winState.winner !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === '1' || key === 'r') {
        e.preventDefault();
        setSelectedIndex(0);
        onChoose('rock');
        return;
      }
      if (key === '2' || key === 'p') {
        e.preventDefault();
        setSelectedIndex(1);
        onChoose('paper');
        return;
      }
      if (key === '3' || key === 's') {
        e.preventDefault();
        setSelectedIndex(2);
        onChoose('scissors');
        return;
      }

      if (e.key === 'ArrowLeft' || key === 'a' || key === 'h') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 2));
        return;
      }
      if (e.key === 'ArrowRight' || key === 'd' || key === 'l') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < 2 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChoose(choices[selectedIndex].id);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, isInteractive, onChoose, winState.winner]);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Showdown arena */}
      <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-2xl shadow-black/40 mb-3">
        <div className="flex items-center justify-around gap-4 py-6">
          {/* Player 1 Card */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-wider">Player 1</span>
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-2 transition-all ${
                revealed && p1Choice
                  ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/20 scale-105'
                  : p1Choice
                  ? 'bg-slate-800 border-rose-500/60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              {revealed && p1Choice ? (
                choices.find(c => c.id === p1Choice)?.icon || '❓'
              ) : p1Choice ? (
                <CheckCircle className="w-8 h-8 text-rose-400 animate-pulse" />
              ) : (
                <span className="text-2xl text-slate-700">?</span>
              )}
            </div>
            <span className="text-xs text-slate-400 mt-2 font-medium capitalize">
              {revealed && p1Choice ? p1Choice : p1Choice ? 'Locked In' : 'Waiting...'}
            </span>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-slate-500 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
              VS
            </span>
            {revealed && lastRound && (
              <span className="text-xs font-bold mt-2 text-center text-amber-300">
                {lastRound.winner === 'draw'
                  ? "It's a Tie!"
                  : lastRound.winner === 'player1'
                  ? 'P1 Wins Round!'
                  : 'P2 Wins Round!'}
              </span>
            )}
          </div>

          {/* Player 2 Card */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">Player 2</span>
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-2 transition-all ${
                revealed && p2Choice
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-400/20 scale-105'
                  : p2Choice
                  ? 'bg-slate-800 border-amber-400/60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              {revealed && p2Choice ? (
                choices.find(c => c.id === p2Choice)?.icon || '❓'
              ) : p2Choice ? (
                <CheckCircle className="w-8 h-8 text-amber-400 animate-pulse" />
              ) : (
                <span className="text-2xl text-slate-700">?</span>
              )}
            </div>
            <span className="text-xs text-slate-400 mt-2 font-medium capitalize">
              {revealed && p2Choice ? p2Choice : p2Choice ? 'Locked In' : 'Waiting...'}
            </span>
          </div>
        </div>

        {/* Choice buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <p className="text-center text-xs text-slate-400 mb-3 font-medium">
            {winState.winner !== null
              ? 'Match finished!'
              : 'Select your move (Best of 3 rounds):'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {choices.map((c, idx) => {
              const disabled = !isInteractive || winState.winner !== null;
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    onChoose(c.id);
                  }}
                  disabled={disabled}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    disabled
                      ? 'bg-slate-900/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg cursor-pointer scale-[1.02]'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-500 active:scale-95 cursor-pointer shadow-md'
                  }`}
                >
                  <span className="text-3xl mb-1">{c.icon}</span>
                  <span className="text-xs font-bold text-white">{c.label}</span>
                  <span className="text-[10px] text-slate-400">beats {c.beats}</span>
                  <kbd className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] text-indigo-300 font-mono">
                    {c.keyHint}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-800">
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Keys:
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">1/R</kbd>
          <span>Rock</span>
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">2/P</kbd>
          <span>Paper</span>
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">3/S</kbd>
          <span>Scissors</span>
        </span>
      </div>
    </div>
  );
};
