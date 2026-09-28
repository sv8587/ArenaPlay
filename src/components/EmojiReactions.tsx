import React from 'react';
import { Smile } from 'lucide-react';

interface FloatingReaction {
  id: string;
  emoji: string;
  from: string;
}

interface EmojiReactionsProps {
  onSendReaction: (emoji: string) => void;
  reactions: FloatingReaction[];
}

const EMOJIS = ['🔥', '👏', '😮', '😂', '🎯', '🤔', '👑', '🤝'];

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  onSendReaction,
  reactions,
}) => {
  return (
    <>
      {/* Floating Reaction Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map(r => (
          <div
            key={r.id}
            className="absolute bottom-20 right-8 sm:right-16 flex flex-col items-center animate-float-reaction"
          >
            <div className="text-4xl sm:text-5xl filter drop-shadow-lg">{r.emoji}</div>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700/60 shadow">
              {r.from}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Reaction Toolbar */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl max-w-xs mx-auto mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">React:</span>
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-all cursor-pointer"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
