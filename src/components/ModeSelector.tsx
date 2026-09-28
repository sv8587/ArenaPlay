import React, { useState } from 'react';
import {
  Users,
  Bot,
  Globe,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Zap,
  KeyRound,
  Rocket,
  Clock,
  Share2,
} from 'lucide-react';
import { GameMode, AIDifficulty, GameRoomState } from '../types/game';

interface ModeSelectorProps {
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  onlineRoom: GameRoomState | null;
  onSetLocal: () => void;
  onSetAi: (diff: AIDifficulty) => void;
  onSetOnline: () => void;
  onCreateOnlineRoom: (name: string) => void;
  onJoinOnlineRoom: (code: string, name: string) => void;
  onLeaveOnlineRoom: () => void;
  timeLimit: number;
  onSetTimeLimit: (limit: number) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  gameMode,
  aiDifficulty,
  onlineRoom,
  onSetLocal,
  onSetAi,
  onSetOnline,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onLeaveOnlineRoom,
  timeLimit,
  onSetTimeLimit,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleCopyLink = () => {
    if (!onlineRoom) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${onlineRoom.roomId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleQuickCreate = () => {
    onCreateOnlineRoom(userName.trim() || 'Player 1');
  };

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinOnlineRoom(joinCode.trim().toUpperCase(), userName.trim() || 'Challenger');
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-4 bg-slate-900/80 backdrop-blur-xl rounded-3xl border-2 border-indigo-500/30 p-3.5 sm:p-4 shadow-2xl shadow-indigo-950/40 relative z-20">
      {/* 3 Main Mode Segmented Switchers */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-3.5">
        {/* 1. Pass & Play */}
        <button
          onClick={onSetLocal}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            gameMode === 'local'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
          }`}
        >
          <span className="text-base sm:text-sm">👥</span>
          <span className="truncate">Pass & Play</span>
        </button>

        {/* 2. Vs Computer */}
        <button
          onClick={() => onSetAi(aiDifficulty)}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            gameMode === 'ai'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
          }`}
        >
          <span className="text-base sm:text-sm">🤖</span>
          <span className="truncate">Vs Computer</span>
        </button>

        {/* 3. Online Room */}
        <button
          onClick={onSetOnline}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            gameMode === 'online'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
          }`}
        >
          <span className="text-base sm:text-sm">🌐</span>
          <span className="truncate">Online Room</span>
          {onlineRoom && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping hidden sm:inline" />
          )}
        </button>
      </div>

      {/* Mode Sub-Panels */}

      {/* 1. Pass & Play Sub-Controls */}
      {gameMode === 'local' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-1 py-1 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>2 Players sharing this screen &bull; Take turns dropping pieces!</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Timer:</span>
            <select
              value={timeLimit}
              onChange={e => onSetTimeLimit(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-xs font-bold cursor-pointer outline-none"
            >
              <option value={0} className="bg-slate-900">Unlimited</option>
              <option value={15} className="bg-slate-900">15s Fast</option>
              <option value={30} className="bg-slate-900">30s Standard</option>
              <option value={60} className="bg-slate-900">60s Casual</option>
            </select>
          </div>
        </div>
      )}

      {/* 2. Vs Computer Sub-Controls */}
      {gameMode === 'ai' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-lg">🤖</span>
            <div>
              <span className="font-bold text-white block">Bot Opponent Ready!</span>
              <span className="text-[11px] text-slate-400">Play solo anytime against the computer</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 px-1.5">Difficulty:</span>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => onSetAi(diff)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer flex items-center gap-1 ${
                  aiDifficulty === diff
                    ? diff === 'easy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                      : diff === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{diff === 'easy' ? '🌱' : diff === 'medium' ? '🧠' : '👑'}</span>
                <span>{diff === 'hard' ? 'Master' : diff}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Online Room Sub-Controls */}
      {gameMode === 'online' && !onlineRoom && (
        <div className="space-y-3 px-1 py-1">
          {/* Nickname input bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Your Player Nickname (e.g. AceGamer 🦊)"
              maxLength={16}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {!showJoinDialog ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Quick Create Room Button */}
              <button
                onClick={handleQuickCreate}
                className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95 group"
              >
                <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-left">
                  <span className="block font-black text-sm">Create New Room</span>
                  <span className="text-[10px] text-emerald-100/80 font-normal">Generate code & invite friend</span>
                </div>
              </button>

              {/* Join With Code Button */}
              <button
                onClick={() => setShowJoinDialog(true)}
                className="flex items-center justify-center gap-2 p-3 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl text-xs font-bold transition-all border border-slate-700 cursor-pointer active:scale-95 group"
              >
                <KeyRound className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <div className="text-left">
                  <span className="block font-black text-sm">Join With Code</span>
                  <span className="text-[10px] text-slate-400 font-normal">Enter 6-letter room code</span>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="6-LETTER CODE (e.g. 7X8K2M)"
                maxLength={6}
                autoFocus
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono font-bold tracking-widest text-center placeholder-slate-500 outline-none focus:border-emerald-500"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="flex-1 sm:flex-none py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Join Game
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinDialog(false)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Play live with anyone in another tab or across the internet!</span>
          </p>
        </div>
      )}

      {/* 3. Online Room Active Lobby View */}
      {gameMode === 'online' && onlineRoom && (
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/90 p-3 rounded-2xl border border-emerald-500/30">
            {/* Room Code Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                📶
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Room Code:</span>
                  <span className="font-mono text-sm font-black text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/40 tracking-widest">
                    {onlineRoom.roomId}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300">
                  {onlineRoom.player2 ? (
                    <span className="text-emerald-400 font-bold">● 2/2 Players Ready! Fight!</span>
                  ) : (
                    <span className="text-amber-400 font-medium animate-pulse">● Waiting for player 2 to connect...</span>
                  )}
                </span>
              </div>
            </div>

            {/* Room Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyLink}
                title="Copy share link to clipboard"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Link Copied!' : 'Share Link'}</span>
              </button>

              <button
                onClick={onLeaveOnlineRoom}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/40 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
