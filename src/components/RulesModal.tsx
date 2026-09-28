import React from 'react';
import { X, Check, Disc, Grid3X3, HandMetal, ShieldCheck, Keyboard } from 'lucide-react';
import { GameType } from '../types/game';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGame: GameType;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  activeGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Official Game Rules</h2>
            <p className="text-xs text-slate-400">Simple instructions to master the arena</p>
          </div>
        </div>

        {/* Connect Four Section */}
        <div
          className={`mb-5 p-4 rounded-2xl border transition-all ${
            activeGame === 'connect4'
              ? 'bg-blue-950/30 border-blue-500/40'
              : 'bg-slate-950/40 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Disc className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-white">Connect Four Rules</h3>
            {activeGame === 'connect4' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold ml-auto">
                Current Game
              </span>
            )}
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>The game is played on a 7-column by 6-row vertical suspended grid.</li>
            <li>Players take turns dropping one colored token into any non-full column.</li>
            <li>Tokens fall straight down under gravity, occupying the lowest available slot in that column.</li>
            <li>
              <strong>Win condition:</strong> The first player to form an unbroken horizontal, vertical, or
              diagonal line of <span className="text-amber-400 font-semibold">four of their own discs</span> wins!
            </li>
            <li>If the board completely fills without a four-in-a-row, the game ends in a draw.</li>
          </ul>
        </div>

        {/* Tic-Tac-Toe Section */}
        <div
          className={`mb-5 p-4 rounded-2xl border transition-all ${
            activeGame === 'tictactoe'
              ? 'bg-cyan-950/30 border-cyan-500/40'
              : 'bg-slate-950/40 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Grid3X3 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Tic-Tac-Toe Rules</h3>
            {activeGame === 'tictactoe' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold ml-auto">
                Current Game
              </span>
            )}
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>Played on a 3x3 grid by Player 1 (X) and Player 2 (O).</li>
            <li>Players alternate placing their mark in any empty square.</li>
            <li>
              <strong>Win condition:</strong> The first player to line up{' '}
              <span className="text-cyan-400 font-semibold">three marks</span> horizontally, vertically, or
              diagonally wins.
            </li>
            <li>If all 9 squares are filled with no three in a row, the match is a tie (Cat's game).</li>
          </ul>
        </div>

        {/* Rock Paper Scissors Section */}
        <div
          className={`mb-5 p-4 rounded-2xl border transition-all ${
            activeGame === 'rps'
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-950/40 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <HandMetal className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Rock Paper Scissors Rules</h3>
            {activeGame === 'rps' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold ml-auto">
                Current Game
              </span>
            )}
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>Both players simultaneously submit a secret choice.</li>
            <li><strong>Rock (🪨)</strong> crushes <strong>Scissors (✂️)</strong>.</li>
            <li><strong>Scissors (✂️)</strong> cuts <strong>Paper (📄)</strong>.</li>
            <li><strong>Paper (📄)</strong> covers <strong>Rock (🪨)</strong>.</li>
            <li>Identical choices result in a tie round. First to win 2 rounds wins the match!</li>
          </ul>
        </div>

        {/* Keyboard Shortcuts Comprehensive Guide */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Keyboard className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm text-slate-100">Power-User Keyboard Shortcuts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 mt-3">
            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="font-bold text-rose-300 block mb-1">Connect Four:</span>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">←</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">→</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">A</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">D</kbd>: Select Column</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">Enter</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">↓</kbd>: Drop Disc</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">1</kbd> - <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">7</kbd>: Instant Drop into Column</p>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="font-bold text-cyan-300 block mb-1">Tic-Tac-Toe:</span>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">↓</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">→</kbd> (or WASD): 2D Grid Move</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">Enter</kbd>: Place Mark (X / O)</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">1</kbd> - <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">9</kbd> & Numpad: Quick Mark Cell</p>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="font-bold text-amber-300 block mb-1">Rock Paper Scissors:</span>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">1</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">R</kbd>: Rock &bull; <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">2</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">P</kbd>: Paper</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">3</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">S</kbd>: Scissors</p>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="font-bold text-purple-300 block mb-1">Arena Shortcuts:</span>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">R</kbd>: Rematch / Restart</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">Z</kbd>: Undo Move &bull; <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">M</kbd>: Mute Sound</p>
              <p className="mt-1"><kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">?</kbd>: Open Rules &bull; <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[11px]">Esc</kbd>: Close Modal</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Got it, Let's Play!
        </button>
      </div>
    </div>
  );
};
