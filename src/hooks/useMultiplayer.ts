import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  GameMode,
  GameType,
  GameRoomState,
  PlayerInfo,
  WinState,
  Connect4Board,
  TTTBoard,
  RPSChoice,
  AIDifficulty,
  GameStats,
} from '../types/game';
import {
  createEmptyConnect4Board,
  getLowestEmptyRow,
  checkConnect4Win,
  createEmptyTTTBoard,
  checkTTTWin,
  evaluateRPSRound,
} from '../utils/gameLogic';
import { getConnect4AIMove, getTTTAIMove } from '../utils/aiOpponent';
import { sounds } from '../utils/audio';

interface FloatingReaction {
  id: string;
  emoji: string;
  from: string;
}

const STATS_STORAGE_KEY = 'arenaplay_stats_v1';

export function useMultiplayer() {
  const [gameType, setGameType] = useState<GameType>('connect4');
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(30); // 0 = off, 30s default
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Players
  const [player1, setPlayer1] = useState<PlayerInfo>({
    id: 'p1',
    name: 'Player 1',
    color: 'red',
    symbol: 'X',
    score: 0,
  });
  const [player2, setPlayer2] = useState<PlayerInfo>({
    id: 'p2',
    name: 'Player 2',
    color: 'yellow',
    symbol: 'O',
    score: 0,
  });
  const [myRole, setMyRole] = useState<'player1' | 'player2' | 'spectator' | 'local'>('local');

  // Boards
  const [c4Board, setC4Board] = useState<Connect4Board>(() => createEmptyConnect4Board());
  const [tttBoard, setTTTBoard] = useState<TTTBoard>(() => createEmptyTTTBoard());
  const [rpsHistory, setRpsHistory] = useState<any[]>([]);
  const [rpsChoices, setRpsChoices] = useState<{ p1: RPSChoice; p2: RPSChoice; revealed: boolean }>({
    p1: null,
    p2: null,
    revealed: false,
  });

  // Current turn & win status
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [winState, setWinState] = useState<WinState>({ winner: null });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [onlineRoom, setOnlineRoom] = useState<GameRoomState | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Undo stack for local/AI play
  const historyStackRef = useRef<any[]>([]);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const myPlayerIdRef = useRef<string>('');

  // Overall Statistics stored in localStorage
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      gamesPlayed: 0,
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      currentStreak: { player: '', count: 0 },
    };
  });

  const updateStats = useCallback((winner: 'player1' | 'player2' | 'draw') => {
    setStats(prev => {
      let streak = { ...prev.currentStreak };
      if (winner === 'draw') {
        streak = { player: '', count: 0 };
      } else if (winner === streak.player) {
        streak.count++;
      } else {
        streak = { player: winner, count: 1 };
      }

      const updated: GameStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        player1Wins: prev.player1Wins + (winner === 'player1' ? 1 : 0),
        player2Wins: prev.player2Wins + (winner === 'player2' ? 1 : 0),
        draws: prev.draws + (winner === 'draw' ? 1 : 0),
        currentStreak: streak,
      };
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Trigger win effects
  const triggerVictory = useCallback((winner: 'player1' | 'player2' | 'draw') => {
    if (winner === 'draw') {
      sounds.playDraw();
    } else {
      sounds.playWin();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: winner === 'player1' ? ['#ef4444', '#f87171', '#fee2e2'] : ['#eab308', '#facc15', '#fef08a'],
        });
      } catch (e) {}
    }
    updateStats(winner);
  }, [updateStats]);

  // WebSocket / BroadcastChannel Setup
  useEffect(() => {
    // Setup BroadcastChannel for zero-latency multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('arenaplay_multiplayer_channel');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        const msg = event.data;
        if (msg.type === 'remote_room_update' && onlineRoom && msg.room?.roomId === onlineRoom.roomId) {
          applyRoomState(msg.room);
        } else if (msg.type === 'remote_reaction' && onlineRoom && msg.roomId === onlineRoom.roomId) {
          showFloatingReaction(msg.emoji, msg.from);
        }
      };
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [onlineRoom?.roomId]);

  const connectWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        resolve(wsRef.current);
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
          setConnectionError(null);
          wsRef.current = ws;
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'room_joined') {
              myPlayerIdRef.current = data.playerId;
              setMyRole(data.yourRole);
              applyRoomState(data.room);
            } else if (data.type === 'room_state_update') {
              applyRoomState(data.room);
              // Broadcast locally across tabs
              broadcastChannelRef.current?.postMessage({
                type: 'remote_room_update',
                room: data.room,
              });
            } else if (data.type === 'reaction') {
              showFloatingReaction(data.emoji, data.fromPlayer);
              sounds.playPop();
            } else if (data.type === 'error') {
              setConnectionError(data.message);
            }
          } catch (e) {
            console.error('WS parse error', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
        };

        ws.onerror = (err) => {
          console.warn('WS connection notice:', err);
          // Fallback to offline / mock room if necessary
          setWsConnected(false);
          reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const isFirstRender = useRef(true);
  const prevTurnRef = useRef<'player1' | 'player2'>(currentTurn);
  const prevLastDropRef = useRef<{ row: number; col: number; player: number } | undefined>(undefined);
  const prevLastMoveRef = useRef<number | undefined>(undefined);

  // Audio Cue: Subtle 'ding' when it becomes the user's turn
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevTurnRef.current = currentTurn;
      return;
    }

    if (winState.winner !== null) return;

    const isTurnChange = prevTurnRef.current !== currentTurn;
    prevTurnRef.current = currentTurn;

    if (!isTurnChange) return;

    if (gameMode === 'online') {
      if (
        (myRole === 'player1' && currentTurn === 'player1') ||
        (myRole === 'player2' && currentTurn === 'player2')
      ) {
        sounds.playYourTurn();
      }
    } else if (gameMode === 'ai') {
      if (currentTurn === 'player1') {
        sounds.playYourTurn();
      }
    } else if (gameMode === 'local') {
      // In local 2-player pass & play, notify players that turn switched
      sounds.playYourTurn();
    }
  }, [currentTurn, gameMode, myRole, winState.winner]);

  const applyRoomState = (room: GameRoomState) => {
    // Check if remote move just arrived
    if (room.connect4.lastDrop && room.connect4.lastDrop !== prevLastDropRef.current) {
      prevLastDropRef.current = room.connect4.lastDrop;
      sounds.playSwish();
      sounds.playDrop(room.connect4.lastDrop.player === 1 ? 1 : 1.25);
    }
    if (room.tictactoe.lastMove !== undefined && room.tictactoe.lastMove !== prevLastMoveRef.current) {
      prevLastMoveRef.current = room.tictactoe.lastMove;
      sounds.playSwish();
      sounds.playMove();
    }

    setOnlineRoom(room);
    setGameType(room.gameType);
    setPlayer1(room.player1);
    if (room.player2) {
      setPlayer2(room.player2);
    }
    setC4Board(room.connect4.board);
    setTTTBoard(room.tictactoe.board);
    setCurrentTurn(room.currentTurn);
    setMoveHistory(room.moveHistory);

    if (room.rps) {
      setRpsHistory(room.rps.rounds || []);
      setRpsChoices({
        p1: room.rps.p1CurrentChoice,
        p2: room.rps.p2CurrentChoice,
        revealed: room.rps.revealed,
      });
    }

    if (room.winState?.winner && (!winState.winner || winState.winner !== room.winState.winner)) {
      setWinState(room.winState);
      triggerVictory(room.winState.winner);
    } else {
      setWinState(room.winState);
    }
  };

  const showFloatingReaction = (emoji: string, from: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setReactions(prev => [...prev.slice(-4), { id, emoji, from }]);
    sounds.playPop();
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2800);
  };

  const sendReaction = (emoji: string) => {
    const sender = myRole === 'player1' ? player1.name : myRole === 'player2' ? player2.name : 'Spectator';
    showFloatingReaction(emoji, sender);

    if (gameMode === 'online' && onlineRoom) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'send_reaction',
            roomId: onlineRoom.roomId,
            emoji,
          })
        );
      }
      broadcastChannelRef.current?.postMessage({
        type: 'remote_reaction',
        roomId: onlineRoom.roomId,
        emoji,
        from: sender,
      });
    }
  };

  // Turn Timer Countdown - passes chance to next player when time runs out
  useEffect(() => {
    if (timeLimit === 0 || winState.winner !== null) return;

    setTimeLeft(timeLimit);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired! The chance goes to the next player
          sounds.playTick(true);

          if (gameMode === 'online') {
            if (onlineRoom) {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    type: 'turn_timeout',
                    roomId: onlineRoom.roomId,
                  })
                );
              }
              const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1';
              const timedOutPlayer = currentTurn === 'player1' ? player1.name : player2.name;
              const nextPlayer = nextTurn === 'player1' ? player1.name : player2.name;
              const updatedRoom: GameRoomState = {
                ...onlineRoom,
                currentTurn: nextTurn,
                turnStartTime: Date.now(),
                moveHistory: [
                  ...onlineRoom.moveHistory,
                  `⏱️ Time ran out for ${timedOutPlayer}! Chance passed to ${nextPlayer}.`,
                ],
              };
              applyRoomState(updatedRoom);
              broadcastChannelRef.current?.postMessage({
                type: 'remote_room_update',
                room: updatedRoom,
              });
            }
          } else {
            // Local Pass & Play or Vs Computer mode
            setCurrentTurn(t => {
              const nextTurn = t === 'player1' ? 'player2' : 'player1';
              const timedOutPlayer = t === 'player1' ? player1.name : player2.name;
              const nextPlayer = nextTurn === 'player1' ? player1.name : player2.name;
              setMoveHistory(h => [
                ...h,
                `⏱️ Time ran out for ${timedOutPlayer}! Chance passed to ${nextPlayer}.`,
              ]);
              return nextTurn;
            });
          }
          return timeLimit;
        }

        if (prev <= 3) {
          sounds.playTick(true); // Critical fast alert tick
        } else if (prev <= 5) {
          sounds.playTick(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, winState.winner, timeLimit, gameMode, onlineRoom, player1.name, player2.name]);

  // Restart / Reset Current Game
  const restartGame = useCallback(() => {
    if (gameMode === 'online' && onlineRoom) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'request_rematch',
            roomId: onlineRoom.roomId,
          })
        );
      }
      return;
    }

    // Local / AI reset
    setC4Board(createEmptyConnect4Board());
    setTTTBoard(createEmptyTTTBoard());
    setRpsHistory([]);
    setRpsChoices({ p1: null, p2: null, revealed: false });
    setWinState({ winner: null });
    // Switch starting player on restart for fairness
    setCurrentTurn(prev => (prev === 'player1' ? 'player2' : 'player1'));
    setTimeLeft(timeLimit || 30);
    historyStackRef.current = [];
    setMoveHistory(prev => [...prev, '--- New Game Started ---']);
  }, [gameMode, onlineRoom, timeLimit]);

  // Undo Move (Local & AI mode)
  const undoLastMove = useCallback(() => {
    if (gameMode === 'online' || winState.winner !== null) return;
    if (historyStackRef.current.length === 0) return;

    const prevState = historyStackRef.current.pop();
    if (prevState) {
      if (prevState.c4Board) setC4Board(prevState.c4Board);
      if (prevState.tttBoard) setTTTBoard(prevState.tttBoard);
      if (prevState.currentTurn) setCurrentTurn(prevState.currentTurn);
      setWinState({ winner: null });
      sounds.playUndo();
    }
  }, [gameMode, winState.winner]);

  // Make Move: Connect 4
  const playConnect4Column = useCallback((col: number) => {
    if (winState.winner !== null) return;

    if (gameMode === 'online') {
      if (!onlineRoom) return;
      const isMyTurn =
        (myRole === 'player1' && currentTurn === 'player1') ||
        (myRole === 'player2' && currentTurn === 'player2');
      if (!isMyTurn) return;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sounds.playSwish();
        wsRef.current.send(
          JSON.stringify({
            type: 'make_move',
            roomId: onlineRoom.roomId,
            moveData: { col },
          })
        );
      }
      return;
    }

    // Local or AI Mode
    const row = getLowestEmptyRow(c4Board, col);
    if (row === -1) return; // Column full

    // Save history for undo
    historyStackRef.current.push({
      c4Board: c4Board.map(r => [...r]),
      currentTurn,
    });

    const playerNum = currentTurn === 'player1' ? 1 : 2;
    const newBoard = c4Board.map((r, rIdx) =>
      rIdx === row
        ? r.map((cVal, cIdx) => (cIdx === col ? playerNum : cVal))
        : [...r]
    );

    setC4Board(newBoard);
    sounds.playSwish();
    sounds.playDrop(playerNum === 1 ? 1 : 1.25);

    const win = checkConnect4Win(newBoard);
    if (win.winner !== null) {
      setWinState(win);
      if (win.winner === 'player1') {
        setPlayer1(p => ({ ...p, score: p.score + 1 }));
      } else if (win.winner === 'player2') {
        setPlayer2(p => ({ ...p, score: p.score + 1 }));
      }
      triggerVictory(win.winner);
    } else {
      const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1';
      setCurrentTurn(nextTurn);
    }
  }, [c4Board, currentTurn, gameMode, myRole, onlineRoom, triggerVictory, winState.winner]);

  // Make Move: Tic Tac Toe
  const playTTTCell = useCallback((idx: number) => {
    if (winState.winner !== null || tttBoard[idx] !== null) return;

    if (gameMode === 'online') {
      if (!onlineRoom) return;
      const isMyTurn =
        (myRole === 'player1' && currentTurn === 'player1') ||
        (myRole === 'player2' && currentTurn === 'player2');
      if (!isMyTurn) return;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sounds.playSwish();
        wsRef.current.send(
          JSON.stringify({
            type: 'make_move',
            roomId: onlineRoom.roomId,
            moveData: { index: idx },
          })
        );
      }
      return;
    }

    // Local / AI
    historyStackRef.current.push({
      tttBoard: [...tttBoard],
      currentTurn,
    });

    const symbol = currentTurn === 'player1' ? 'X' : 'O';
    const newBoard = [...tttBoard];
    newBoard[idx] = symbol;
    setTTTBoard(newBoard);
    sounds.playSwish();
    sounds.playMove();

    const win = checkTTTWin(newBoard);
    if (win.winner !== null) {
      setWinState(win);
      if (win.winner === 'player1') {
        setPlayer1(p => ({ ...p, score: p.score + 1 }));
      } else if (win.winner === 'player2') {
        setPlayer2(p => ({ ...p, score: p.score + 1 }));
      }
      triggerVictory(win.winner);
    } else {
      setCurrentTurn(prev => (prev === 'player1' ? 'player2' : 'player1'));
    }
  }, [currentTurn, gameMode, myRole, onlineRoom, tttBoard, triggerVictory, winState.winner]);

  // Make Move: Rock Paper Scissors
  const playRPS = useCallback((choice: RPSChoice) => {
    if (winState.winner !== null) return;

    sounds.playSwish();

    if (gameMode === 'online') {
      if (!onlineRoom) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'make_move',
            roomId: onlineRoom.roomId,
            moveData: { choice },
          })
        );
      }
      return;
    }

    if (gameMode === 'local') {
      // In local mode, Player 1 chooses, then Player 2 chooses secretly or together
      if (currentTurn === 'player1') {
        setRpsChoices(prev => ({ ...prev, p1: choice, revealed: false }));
        setCurrentTurn('player2');
        sounds.playMove();
      } else {
        const p1Choice = rpsChoices.p1;
        const p2Choice = choice;
        const winner = evaluateRPSRound(p1Choice, p2Choice);

        setRpsChoices({ p1: p1Choice, p2: p2Choice, revealed: true });
        setRpsHistory(prev => [...prev, { p1Choice, p2Choice, winner }]);

        if (winner === 'player1') {
          setPlayer1(p => ({ ...p, score: p.score + 1 }));
        } else if (winner === 'player2') {
          setPlayer2(p => ({ ...p, score: p.score + 1 }));
        }

        if (winner === 'draw') sounds.playDraw();
        else sounds.playWin();

        // Check best of 3 (first to 2)
        const target = 2;
        const p1Wins = (player1.score + (winner === 'player1' ? 1 : 0));
        const p2Wins = (player2.score + (winner === 'player2' ? 1 : 0));

        if (p1Wins >= target) {
          setWinState({ winner: 'player1' });
          triggerVictory('player1');
        } else if (p2Wins >= target) {
          setWinState({ winner: 'player2' });
          triggerVictory('player2');
        } else {
          // Prepare next round after 2 seconds
          setTimeout(() => {
            setRpsChoices({ p1: null, p2: null, revealed: false });
            setCurrentTurn('player1');
          }, 2000);
        }
      }
    } else if (gameMode === 'ai') {
      // AI chooses immediately
      const options: RPSChoice[] = ['rock', 'paper', 'scissors'];
      const aiChoice = options[Math.floor(Math.random() * options.length)];
      const winner = evaluateRPSRound(choice, aiChoice);

      setRpsChoices({ p1: choice, p2: aiChoice, revealed: true });
      setRpsHistory(prev => [...prev, { p1Choice: choice, p2Choice: aiChoice, winner }]);

      if (winner === 'player1') {
        setPlayer1(p => ({ ...p, score: p.score + 1 }));
      } else if (winner === 'player2') {
        setPlayer2(p => ({ ...p, score: p.score + 1 }));
      }

      if (winner === 'draw') sounds.playDraw();
      else sounds.playWin();

      const target = 2;
      const p1Wins = (player1.score + (winner === 'player1' ? 1 : 0));
      const p2Wins = (player2.score + (winner === 'player2' ? 1 : 0));

      if (p1Wins >= target) {
        setWinState({ winner: 'player1' });
        triggerVictory('player1');
      } else if (p2Wins >= target) {
        setWinState({ winner: 'player2' });
        triggerVictory('player2');
      } else {
        setTimeout(() => {
          setRpsChoices({ p1: null, p2: null, revealed: false });
        }, 2000);
      }
    }
  }, [currentTurn, gameMode, onlineRoom, player1.score, player2.score, rpsChoices.p1, triggerVictory, winState.winner]);

  // AI Turn Trigger (when gameMode === 'ai' and it's player2's turn)
  useEffect(() => {
    if (gameMode !== 'ai' || currentTurn !== 'player2' || winState.winner !== null) {
      return;
    }

    setIsAiThinking(true);
    // Slight artificial delay so AI feels thoughtful & animation plays cleanly
    const delay = Math.floor(Math.random() * 300) + 400;
    const timer = setTimeout(() => {
      setIsAiThinking(false);

      if (gameType === 'connect4') {
        const aiCol = getConnect4AIMove(c4Board, aiDifficulty);
        const row = getLowestEmptyRow(c4Board, aiCol);
        if (row === -1) return;

        const newBoard = c4Board.map((r, rIdx) =>
          rIdx === row
            ? r.map((cVal, cIdx) => (cIdx === aiCol ? 2 : cVal))
            : [...r]
        );
        setC4Board(newBoard);
        sounds.playSwish();
        sounds.playDrop(1.25);

        const win = checkConnect4Win(newBoard);
        if (win.winner !== null) {
          setWinState(win);
          if (win.winner === 'player2') {
            setPlayer2(p => ({ ...p, score: p.score + 1 }));
          }
          triggerVictory(win.winner);
        } else {
          setCurrentTurn('player1');
        }
      } else if (gameType === 'tictactoe') {
        const aiIdx = getTTTAIMove(tttBoard, aiDifficulty);
        if (aiIdx === -1 || tttBoard[aiIdx] !== null) return;

        const newBoard = [...tttBoard];
        newBoard[aiIdx] = 'O';
        setTTTBoard(newBoard);
        sounds.playSwish();
        sounds.playMove();

        const win = checkTTTWin(newBoard);
        if (win.winner !== null) {
          setWinState(win);
          if (win.winner === 'player2') {
            setPlayer2(p => ({ ...p, score: p.score + 1 }));
          }
          triggerVictory(win.winner);
        } else {
          setCurrentTurn('player1');
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [aiDifficulty, c4Board, currentTurn, gameMode, gameType, tttBoard, triggerVictory, winState.winner]);

  // Room Creation / Joining for Online Multiplayer
  const createOnlineRoom = async (name: string, chosenGame: GameType = gameType) => {
    try {
      const ws = await connectWebSocket();
      setGameMode('online');
      setGameType(chosenGame);
      ws.send(
        JSON.stringify({
          type: 'create_room',
          gameType: chosenGame,
          playerName: name || 'Player 1',
          preferredColor: 'red',
          timeLimit,
        })
      );
    } catch (e) {
      // Fallback: create room via BroadcastChannel
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const p1: PlayerInfo = {
        id: `p_${Math.random().toString(36).substring(2, 9)}`,
        name: name || 'Player 1',
        color: 'red',
        symbol: 'X',
        score: 0,
      };
      const fallbackRoom: GameRoomState = {
        roomId: randomCode,
        gameType: chosenGame,
        gameMode: 'online',
        player1: p1,
        player2: null,
        spectators: [],
        currentTurn: 'player1',
        turnStartTime: Date.now(),
        timeLimit: timeLimit || 30,
        connect4: { board: createEmptyConnect4Board() },
        tictactoe: { board: createEmptyTTTBoard() },
        rps: { rounds: [], p1CurrentChoice: null, p2CurrentChoice: null, revealed: false, bestOf: 3 },
        winState: { winner: null },
        rematchRequestedBy: null,
        moveHistory: ['Room created (P2P Broadcast enabled)'],
      };
      myPlayerIdRef.current = p1.id;
      setMyRole('player1');
      setGameMode('online');
      setGameType(chosenGame);
      applyRoomState(fallbackRoom);
      broadcastChannelRef.current?.postMessage({
        type: 'remote_room_update',
        room: fallbackRoom,
      });
    }
  };

  const joinOnlineRoom = async (code: string, name: string) => {
    try {
      const ws = await connectWebSocket();
      setGameMode('online');
      ws.send(
        JSON.stringify({
          type: 'join_room',
          roomId: code.toUpperCase().trim(),
          playerName: name || 'Player 2',
          preferredColor: 'yellow',
        })
      );
    } catch (e) {
      setConnectionError('Could not join room via server. Trying local broadcast...');
    }
  };

  const leaveOnlineRoom = () => {
    if (wsRef.current && onlineRoom) {
      wsRef.current.send(
        JSON.stringify({
          type: 'leave_room',
          roomId: onlineRoom.roomId,
        })
      );
    }
    setOnlineRoom(null);
    setGameMode('local');
    setMyRole('local');
    restartGame();
  };

  const switchGame = (newGame: GameType) => {
    setGameType(newGame);
    setC4Board(createEmptyConnect4Board());
    setTTTBoard(createEmptyTTTBoard());
    setRpsHistory([]);
    setRpsChoices({ p1: null, p2: null, revealed: false });
    setWinState({ winner: null });
    setCurrentTurn('player1');
    setTimeLeft(timeLimit || 30);
    setMoveHistory([]);

    if (gameMode === 'online' && onlineRoom && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: 'switch_game',
          roomId: onlineRoom.roomId,
          gameType: newGame,
        })
      );
    }
  };

  const setLocalMode = () => {
    setGameMode('local');
    setMyRole('local');
    setPlayer1({ id: 'p1', name: 'Player 1', color: 'red', symbol: 'X', score: 0 });
    setPlayer2({ id: 'p2', name: 'Player 2', color: 'yellow', symbol: 'O', score: 0 });
    restartGame();
  };

  const setAiMode = (diff: AIDifficulty = 'medium') => {
    setGameMode('ai');
    setAiDifficulty(diff);
    setMyRole('player1');
    setPlayer1({ id: 'p1', name: 'You', color: 'red', symbol: 'X', score: 0 });
    setPlayer2({
      id: 'ai',
      name: `AI Bot (${diff.toUpperCase()})`,
      color: 'yellow',
      symbol: 'O',
      score: 0,
    });
    restartGame();
  };

  const setOnlineMode = () => {
    setGameMode('online');
    if (!onlineRoom) {
      setMyRole('player1');
      setPlayer1({ id: 'p1', name: 'You (Host)', color: 'red', symbol: 'X', score: 0 });
      setPlayer2({ id: 'p2', name: 'Waiting for friend...', color: 'yellow', symbol: 'O', score: 0 });
    }
  };

  return {
    gameType,
    gameMode,
    aiDifficulty,
    setAiDifficulty,
    timeLimit,
    setTimeLimit,
    timeLeft,
    player1,
    setPlayer1,
    player2,
    setPlayer2,
    myRole,
    currentTurn,
    winState,
    c4Board,
    tttBoard,
    rpsChoices,
    rpsHistory,
    moveHistory,
    reactions,
    onlineRoom,
    wsConnected,
    connectionError,
    stats,
    isAiThinking,
    // Actions
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
    canUndo: gameMode !== 'online' && historyStackRef.current.length > 0 && winState.winner === null,
  };
}
