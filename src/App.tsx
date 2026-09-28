/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMultiplayer } from './hooks/useMultiplayer';
import { Header } from './components/Header';
import { PlayerCard } from './components/PlayerCard';
import { ModeSelector } from './components/ModeSelector';
import { GameStatusBanner } from './components/GameStatusBanner';
import { ConnectFourBoard } from './components/ConnectFourBoard';
import { TicTacToeBoard } from './components/TicTacToeBoard';
import { RockPaperScissorsArena } from './components/RockPaperScissorsArena';
import { EmojiReactions } from './components/EmojiReactions';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';
import { CartoonBackground } from './components/CartoonBackground';
import { sounds } from './utils/audio';

export default function App() {
  const {
    gameType,
    gameMode,
    aiDifficulty,
    setAiDifficulty,
    timeLimit,
    setTimeLimit,
    timeLeft,
    player1,
    player2,
    myRole,
    currentTurn,
    winState,
    c4Board,
    tttBoard,
    rpsChoices,
    rpsHistory,
    reactions,
    onlineRoom,
    stats,
    isAiThinking,
    playConnect4Column,
    playTTTCell,
    playRPS,
    restartGame,
    undoLastMove,
    sendReaction,
    createOnlineRoom,
    joinOnlineRoom,
    leaveOnlineRoom,
    switchGame,
    setLocalMode,
    setAiMode,
    setOnlineMode,
    canUndo,
  } = useMultiplayer();

  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Global Keyboard Shortcuts for power users
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setIsRulesOpen(false);
        setIsStatsOpen(false);
        return;
      }

      // 'm' or 'M' -> Toggle sound
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSound();
        return;
      }

      // '?' -> Open Rules
      if (e.key === '?') {
        e.preventDefault();
        setIsRulesOpen(prev => !prev);
        return;
      }

      // 'z' or 'Z' -> Undo move (when applicable)
      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
        if (canUndo && gameType !== 'rps') {
          e.preventDefault();
          undoLastMove();
        }
        return;
      }

      // 'r' or 'R' -> Restart or Rematch (if game type is not RPS where 'r' is rock)
      if ((e.key === 'r' || e.key === 'R') && gameType !== 'rps') {
        e.preventDefault();
        restartGame();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [canUndo, gameType, restartGame, undoLastMove]);

  // Check URL query parameters on mount to auto-join rooms
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !onlineRoom) {
      joinOnlineRoom(roomParam, 'Challenger');
    }
  }, []);

  const handleResetStats = () => {
    localStorage.removeItem('arenaplay_stats_v1');
    window.location.reload();
  };

  // Determine if active user can make moves
  const isInteractive =
    gameMode === 'local'
      ? true
      : gameMode === 'ai'
      ? currentTurn === 'player1'
      : gameMode === 'online'
      ? (myRole === 'player1' && currentTurn === 'player1') ||
        (myRole === 'player2' && currentTurn === 'player2')
      : true;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white pb-6 relative overflow-x-hidden">
      {/* Friendly Cartoon Animated Background */}
      <CartoonBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation & Controls Header */}
        <Header
          gameType={gameType}
          onSwitchGame={switchGame}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          isMuted={isMuted}
          onToggleMute={toggleSound}
        />

        <main className="w-full max-w-5xl mx-auto px-4 flex-1 flex flex-col justify-start">
          {/* Mode Selector & Room Management */}
          <ModeSelector
            gameMode={gameMode}
            aiDifficulty={aiDifficulty}
            onlineRoom={onlineRoom}
            onSetLocal={setLocalMode}
            onSetAi={setAiMode}
            onSetOnline={setOnlineMode}
            onCreateOnlineRoom={name => createOnlineRoom(name, gameType)}
            onJoinOnlineRoom={joinOnlineRoom}
            onLeaveOnlineRoom={leaveOnlineRoom}
            timeLimit={timeLimit}
            onSetTimeLimit={setTimeLimit}
          />

          {/* Player Cards (2-Player Status) */}
          <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-3 mb-4">
            <PlayerCard
              player={player1}
              role="player1"
              isCurrentTurn={currentTurn === 'player1' && winState.winner === null}
              timeLeft={timeLeft}
              timeLimit={timeLimit}
              isAi={false}
              isWinner={winState.winner === 'player1'}
              isYou={gameMode === 'online' ? myRole === 'player1' : gameMode === 'ai'}
              gameMode={gameMode}
            />

            <div className="text-center font-black text-slate-600 text-xs px-1 select-none">
              VS
            </div>

            <PlayerCard
              player={
                player2 || {
                  id: 'p2_placeholder',
                  name: gameMode === 'online' ? 'Waiting...' : 'Player 2',
                  color: 'yellow',
                  symbol: 'O',
                  score: 0,
                }
              }
              role="player2"
              isCurrentTurn={currentTurn === 'player2' && winState.winner === null}
              timeLeft={timeLeft}
              timeLimit={timeLimit}
              isAi={gameMode === 'ai'}
              isAiThinking={isAiThinking}
              isWinner={winState.winner === 'player2'}
              isYou={gameMode === 'online' && myRole === 'player2'}
              gameMode={gameMode}
            />
          </div>

          {/* Turn / Winner Status Banner */}
          <GameStatusBanner
            winState={winState}
            currentTurn={currentTurn}
            player1={player1}
            player2={player2}
            gameMode={gameMode}
            onRestart={restartGame}
            onUndo={undoLastMove}
            canUndo={canUndo}
            myRole={myRole}
          />

          {/* Interactive Game Arena */}
          <div className="flex-1 flex flex-col items-center justify-center my-2">
            {gameType === 'connect4' && (
              <ConnectFourBoard
                board={c4Board}
                currentTurn={currentTurn}
                winState={winState}
                onDropDisc={playConnect4Column}
                isInteractive={isInteractive}
              />
            )}

            {gameType === 'tictactoe' && (
              <TicTacToeBoard
                board={tttBoard}
                currentTurn={currentTurn}
                winState={winState}
                onSelectCell={playTTTCell}
                isInteractive={isInteractive}
              />
            )}

            {gameType === 'rps' && (
              <RockPaperScissorsArena
                currentTurn={currentTurn}
                winState={winState}
                p1Choice={rpsChoices.p1}
                p2Choice={rpsChoices.p2}
                revealed={rpsChoices.revealed}
                history={rpsHistory}
                onChoose={playRPS}
                isInteractive={isInteractive}
                myRole={myRole}
              />
            )}
          </div>

          {/* Quick Reaction Bar */}
          <EmojiReactions onSendReaction={sendReaction} reactions={reactions} />
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-600 mt-6 select-none">
        ArenaPlay Multiplayer &bull; Built with React, TypeScript & WebSockets &bull; Fully Responsive
      </footer>

      {/* Modals */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        activeGame={gameType}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={handleResetStats}
      />
    </div>
  );
}
