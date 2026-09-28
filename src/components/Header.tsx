import React from 'react';
import { Volume2, VolumeX, HelpCircle, Trophy, Sparkles, Swords, Grid3X3, Disc, HandMetal } from 'lucide-react';
import { GameType } from '../types/game';
import { sounds } from '../utils/audio';

interface HeaderProps {
  gameType: GameType;
  onSwitchGame: (type: GameType) => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameType,
  onSwitchGame,
  onOpenRules,
  onOpenStats,
  isMuted,
  onToggleMute,
}) => {
  const games: { id: GameType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'connect4', label: 'Connect Four', icon: <Disc className="w-4 h-4 text-rose-400" />, badge: 'Popular' },
    { id: 'tictactoe', label: 'Tic-Tac-Toe', icon: <Grid3X3 className="w-4 h-4 text-cyan-400" /> },
    { id: 'rps', label: 'Rock Paper Scissors', icon: <HandMetal className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <header className="w-full max-w-5xl mx-auto px-4 pt-4 pb-3 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md rounded-2xl mb-4 shadow-xl shadow-black/20">
      {/* Brand title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Swords className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Arena<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400">Play</span>
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider uppercase">
              Live 2P
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Real-time Browser Multiplayer Arena</p>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl shadow-inner max-w-full overflow-x-auto">
        {games.map(g => {
          const isActive = gameType === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSwitchGame(g.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-slate-800 to-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {g.icon}
              <span>{g.label}</span>
              {g.badge && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                  {g.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onOpenStats}
          title="View Leaderboard & Stats"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition-all text-xs font-medium cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Stats</span>
        </button>

        <button
          onClick={onOpenRules}
          title="Game Rules & Guide"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all text-xs font-medium cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Rules</span>
        </button>
      </div>
    </header>
  );
};
