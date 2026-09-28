import React from 'react';
import { User, Bot, Crown, Clock, AlertTriangle, Flame } from 'lucide-react';
import { PlayerInfo, GameMode } from '../types/game';

interface PlayerCardProps {
  player: PlayerInfo;
  role: 'player1' | 'player2';
  isCurrentTurn: boolean;
  timeLeft: number;
  timeLimit: number;
  isAi: boolean;
  isAiThinking?: boolean;
  isWinner: boolean;
  isYou: boolean;
  gameMode: GameMode;
  onEditName?: (name: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  role,
  isCurrentTurn,
  timeLeft,
  timeLimit,
  isAi,
  isAiThinking,
  isWinner,
  isYou,
  gameMode,
  onEditName,
}) => {
  const isP1 = role === 'player1';
  const colorBg = isP1
    ? 'bg-rose-500'
    : 'bg-amber-400';
  const colorGlow = isP1
    ? 'border-rose-500 shadow-rose-500/30'
    : 'border-amber-400 shadow-amber-400/30';
  const textColor = isP1 ? 'text-rose-400' : 'text-amber-400';

  const timerPercent = timeLimit > 0 ? Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100)) : 100;
  // Flashes red when less than 5 seconds remain on active turn
  const isTimerCritical = isCurrentTurn && timeLimit > 0 && timeLeft < 5;

  return (
    <div
      className={`relative flex-1 min-w-[140px] max-w-sm rounded-2xl p-3.5 transition-all duration-300 border ${
        isTimerCritical
          ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/80 shadow-2xl shadow-rose-600/40 animate-flash-red scale-[1.03]'
          : isCurrentTurn
          ? `bg-slate-900/90 shadow-xl ${colorGlow} ring-2 ${isP1 ? 'ring-rose-500/40' : 'ring-amber-400/40'} scale-[1.02]`
          : 'bg-slate-900/50 border-slate-800/80 opacity-85 hover:opacity-100'
      }`}
    >
      {/* Crown badge if winner */}
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/40 uppercase tracking-widest animate-bounce z-20">
          <Crown className="w-3 h-3 fill-slate-950" />
          Winner!
        </div>
      )}

      {/* Cartoon Thought Bubble for AI */}
      {isAi && isAiThinking && (
        <div className="absolute -top-8 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-black px-3 py-1 rounded-2xl border border-purple-300 shadow-xl shadow-purple-600/40 animate-bounce flex items-center gap-1.5 z-30">
          <span className="text-sm">🤖</span>
          <span>Thinking... 💭</span>
        </div>
      )}

      {/* Flashing Turn Countdown Warning Pill (top right) */}
      {isCurrentTurn && timeLimit > 0 && (
        <div
          className={`absolute -top-3 right-3 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-mono font-bold tracking-tight shadow-lg transition-all z-20 ${
            isTimerCritical
              ? 'bg-rose-600 border border-rose-400 text-white animate-flash-red'
              : 'bg-slate-900 border border-slate-700 text-slate-200'
          }`}
        >
          {isTimerCritical ? (
            <>
              <AlertTriangle className="w-3 h-3 text-white animate-bounce stroke-[2.5]" />
              <span className="animate-text-flash-red font-black">{timeLeft}s</span>
              <span className="text-[9px] uppercase font-black text-rose-200 tracking-wider">HURRY!</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{timeLeft}s</span>
            </>
          )}
        </div>
      )}

      {/* Top row: Avatar & Identity */}
      <div className="flex items-center gap-3">
        <div
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-md ${colorBg} ${
            isCurrentTurn ? 'ring-2 ring-white/60 scale-105' : ''
          } transition-transform`}
        >
          {isAi ? (
            <span className="text-2xl animate-cartoon-wiggle select-none">🤖</span>
          ) : isP1 ? (
            <span className="text-2xl select-none">🦊</span>
          ) : (
            <span className="text-2xl select-none">🦁</span>
          )}

          {/* Symbol badge (X or O) */}
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-black flex items-center justify-center text-white shadow">
            {player.symbol || (isP1 ? 'X' : 'O')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-white truncate max-w-[100px] sm:max-w-[130px]">
              {player.name}
            </span>
            {isYou && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1 font-semibold text-white">
              <span className="text-slate-400 font-normal">Wins:</span> {player.score}
            </span>
            {isCurrentTurn && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isTimerCritical ? 'text-rose-400' : textColor
                } flex items-center gap-1`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isTimerCritical ? 'bg-rose-500' : 'bg-current'
                  } animate-ping`}
                />
                {isAiThinking ? 'Thinking...' : isTimerCritical ? 'Timeout Soon!' : 'Turn'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Turn Countdown Progress Indicator */}
      {isCurrentTurn && timeLimit > 0 && (
        <div
          className={`mt-3 pt-2.5 border-t transition-colors ${
            isTimerCritical ? 'border-rose-500/40' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span
              className={`flex items-center gap-1 font-medium ${
                isTimerCritical ? 'text-rose-300 font-semibold' : 'text-slate-400'
              }`}
            >
              {isTimerCritical ? (
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse stroke-[2.5]" />
              ) : (
                <Clock className="w-3 h-3 text-slate-400" />
              )}
              <span>{isTimerCritical ? 'Critical Time' : 'Turn Clock'}</span>
            </span>

            <span
              className={`font-mono font-bold ${
                isTimerCritical
                  ? 'text-sm font-black animate-text-flash-red'
                  : 'text-slate-300'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* Progress bar with red strobe when < 5s */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isTimerCritical
                  ? 'animate-bar-strobe-red shadow-[0_0_10px_rgba(244,63,94,0.9)]'
                  : isP1
                  ? 'bg-rose-400'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
