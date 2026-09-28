import React from 'react';
import { Trophy, Flame, X, RotateCcw, Award } from 'lucide-react';
import { GameStats } from '../types/game';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const total = stats.gamesPlayed;
  const p1Rate = total > 0 ? Math.round((stats.player1Wins / total) * 100) : 0;
  const p2Rate = total > 0 ? Math.round((stats.player2Wins / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/80">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Arena Statistics</h2>
            <p className="text-xs text-slate-400">Performance across all matches</p>
          </div>
        </div>

        {/* Total Matches Banner */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-400" />
            <div>
              <span className="text-xs text-slate-400 block">Total Games</span>
              <span className="text-xl font-black text-white">{stats.gamesPlayed}</span>
            </div>
          </div>

          {stats.currentStreak.count > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="text-right">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Streak</span>
                <span className="text-sm font-black">{stats.currentStreak.count} Win{stats.currentStreak.count > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Win breakdown */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Player 1</span>
            <span className="text-2xl font-black text-white my-0.5 block">{stats.player1Wins}</span>
            <span className="text-[10px] text-rose-300/80 font-medium">{p1Rate}% rate</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Draws</span>
            <span className="text-2xl font-black text-white my-0.5 block">{stats.draws}</span>
            <span className="text-[10px] text-slate-500 font-medium">Tied</span>
          </div>

          <div className="bg-amber-950/20 border border-amber-400/30 p-3 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Player 2</span>
            <span className="text-2xl font-black text-white my-0.5 block">{stats.player2Wins}</span>
            <span className="text-[10px] text-amber-300/80 font-medium">{p2Rate}% rate</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetStats}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
