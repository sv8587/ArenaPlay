import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GameRoomState,
  GameType,
  WSClientMessage,
  WSServerMessage,
  PlayerInfo,
  RPSChoice,
} from './src/types/game.js';
import {
  createEmptyConnect4Board,
  getLowestEmptyRow,
  checkConnect4Win,
  createEmptyTTTBoard,
  checkTTTWin,
  evaluateRPSRound,
} from './src/utils/gameLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// In-memory room store
const rooms = new Map<string, GameRoomState>();
// Map client connection to { roomId, playerId }
interface ClientMeta {
  ws: WebSocket;
  roomId?: string;
  playerId?: string;
  isAlive: boolean;
}
const clients = new Map<WebSocket, ClientMeta>();

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createInitialRoomState(
  roomId: string,
  gameType: GameType,
  player1: PlayerInfo,
  timeLimit = 30
): GameRoomState {
  return {
    roomId,
    gameType,
    gameMode: 'online',
    player1,
    player2: null,
    spectators: [],
    currentTurn: 'player1',
    turnStartTime: Date.now(),
    timeLimit,
    connect4: {
      board: createEmptyConnect4Board(),
    },
    tictactoe: {
      board: createEmptyTTTBoard(),
    },
    rps: {
      rounds: [],
      p1CurrentChoice: null,
      p2CurrentChoice: null,
      revealed: false,
      bestOf: 3,
    },
    winState: { winner: null },
    rematchRequestedBy: null,
    moveHistory: [],
  };
}

function broadcastToRoom(roomId: string, message: WSServerMessage) {
  const json = JSON.stringify(message);
  for (const [ws, meta] of clients.entries()) {
    if (meta.roomId === roomId && ws.readyState === WebSocket.OPEN) {
      ws.send(json);
    }
  }
}

function resetGameForRematch(room: GameRoomState) {
  room.connect4.board = createEmptyConnect4Board();
  delete room.connect4.lastDrop;

  room.tictactoe.board = createEmptyTTTBoard();
  delete room.tictactoe.lastMove;

  room.rps.rounds = [];
  room.rps.p1CurrentChoice = null;
  room.rps.p2CurrentChoice = null;
  room.rps.revealed = false;

  room.winState = { winner: null };
  room.rematchRequestedBy = null;
  // Alternate starting player
  room.currentTurn = room.currentTurn === 'player1' ? 'player2' : 'player1';
  room.turnStartTime = Date.now();
  room.moveHistory.push(`--- Rematch started ---`);
}

// WebSocket Connection Management
wss.on('connection', (ws: WebSocket) => {
  const meta: ClientMeta = { ws, isAlive: true };
  clients.set(ws, meta);

  ws.on('pong', () => {
    meta.isAlive = true;
  });

  ws.on('message', (raw: string) => {
    try {
      const data: WSClientMessage = JSON.parse(raw.toString());

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (data.type === 'create_room') {
        const roomId = generateRoomId();
        const p1: PlayerInfo = {
          id: `p_${Math.random().toString(36).substring(2, 9)}`,
          name: data.playerName || 'Player 1',
          color: data.preferredColor || 'red',
          symbol: 'X',
          score: 0,
        };

        const newRoom = createInitialRoomState(roomId, data.gameType, p1, data.timeLimit || 30);
        rooms.set(roomId, newRoom);

        meta.roomId = roomId;
        meta.playerId = p1.id;

        ws.send(
          JSON.stringify({
            type: 'room_joined',
            room: newRoom,
            yourRole: 'player1',
            playerId: p1.id,
          })
        );
        return;
      }

      if (data.type === 'join_room') {
        const roomId = data.roomId.toUpperCase().trim();
        const room = rooms.get(roomId);

        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found. Check code.' }));
          return;
        }

        let role: 'player1' | 'player2' | 'spectator' = 'spectator';
        const playerId = `p_${Math.random().toString(36).substring(2, 9)}`;

        if (!room.player2) {
          // Join as Player 2
          const p2Color = room.player1.color === 'red' ? 'yellow' : 'red';
          room.player2 = {
            id: playerId,
            name: data.playerName || 'Player 2',
            color: data.preferredColor || p2Color,
            symbol: 'O',
            score: 0,
          };
          role = 'player2';
          room.turnStartTime = Date.now();
        } else {
          // Join as spectator
          room.spectators.push({
            id: playerId,
            name: data.playerName || `Spectator ${room.spectators.length + 1}`,
            color: 'blue',
            score: 0,
          });
          role = 'spectator';
        }

        meta.roomId = roomId;
        meta.playerId = playerId;

        ws.send(
          JSON.stringify({
            type: 'room_joined',
            room,
            yourRole: role,
            playerId,
          })
        );

        broadcastToRoom(roomId, {
          type: 'room_state_update',
          room,
        });
        return;
      }

      if (data.type === 'make_move') {
        const room = rooms.get(data.roomId);
        if (!room || !meta.playerId) return;

        // Check if game is already over
        if (room.winState.winner !== null) return;

        const isP1 = room.player1.id === meta.playerId;
        const isP2 = room.player2?.id === meta.playerId;

        if (!isP1 && !isP2) return; // Spectators cannot make moves

        // Game specific logic
        if (room.gameType === 'connect4') {
          const expectedRole = room.currentTurn;
          const moverRole = isP1 ? 'player1' : 'player2';
          if (moverRole !== expectedRole) return;

          const col = Number(data.moveData?.col);
          const row = getLowestEmptyRow(room.connect4.board, col);
          if (row === -1) return; // Column is full

          const playerNum = isP1 ? 1 : 2;
          room.connect4.board[row][col] = playerNum;
          room.connect4.lastDrop = { row, col, player: playerNum };
          room.moveHistory.push(
            `${isP1 ? room.player1.name : room.player2?.name} dropped in column ${col + 1}`
          );

          const win = checkConnect4Win(room.connect4.board);
          if (win.winner !== null) {
            room.winState = win;
            if (win.winner === 'player1') room.player1.score++;
            if (win.winner === 'player2' && room.player2) room.player2.score++;
          } else {
            room.currentTurn = isP1 ? 'player2' : 'player1';
            room.turnStartTime = Date.now();
          }

          broadcastToRoom(data.roomId, {
            type: 'room_state_update',
            room,
          });
        } else if (room.gameType === 'tictactoe') {
          const expectedRole = room.currentTurn;
          const moverRole = isP1 ? 'player1' : 'player2';
          if (moverRole !== expectedRole) return;

          const idx = Number(data.moveData?.index);
          if (idx < 0 || idx > 8 || room.tictactoe.board[idx] !== null) return;

          const symbol = isP1 ? 'X' : 'O';
          room.tictactoe.board[idx] = symbol;
          room.tictactoe.lastMove = idx;
          room.moveHistory.push(
            `${isP1 ? room.player1.name : room.player2?.name} placed ${symbol} at cell ${idx + 1}`
          );

          const win = checkTTTWin(room.tictactoe.board);
          if (win.winner !== null) {
            room.winState = win;
            if (win.winner === 'player1') room.player1.score++;
            if (win.winner === 'player2' && room.player2) room.player2.score++;
          } else {
            room.currentTurn = isP1 ? 'player2' : 'player1';
            room.turnStartTime = Date.now();
          }

          broadcastToRoom(data.roomId, {
            type: 'room_state_update',
            room,
          });
        } else if (room.gameType === 'rps') {
          const choice = data.moveData?.choice as RPSChoice;
          if (!choice) return;

          if (isP1) room.rps.p1CurrentChoice = choice;
          if (isP2) room.rps.p2CurrentChoice = choice;

          // If both have chosen, evaluate round!
          if (room.rps.p1CurrentChoice && room.rps.p2CurrentChoice) {
            const winner = evaluateRPSRound(room.rps.p1CurrentChoice, room.rps.p2CurrentChoice);
            room.rps.revealed = true;
            room.rps.rounds.push({
              p1Choice: room.rps.p1CurrentChoice,
              p2Choice: room.rps.p2CurrentChoice,
              winner,
            });

            if (winner === 'player1') room.player1.score++;
            if (winner === 'player2' && room.player2) room.player2.score++;

            const targetWins = Math.ceil(room.rps.bestOf / 2);
            if (room.player1.score >= targetWins) {
              room.winState = { winner: 'player1' };
            } else if (room.player2 && room.player2.score >= targetWins) {
              room.winState = { winner: 'player2' };
            }

            broadcastToRoom(data.roomId, {
              type: 'room_state_update',
              room,
            });

            // Reset choices for next round if match not yet finished
            if (room.winState.winner === null) {
              setTimeout(() => {
                if (room.winState.winner === null) {
                  room.rps.p1CurrentChoice = null;
                  room.rps.p2CurrentChoice = null;
                  room.rps.revealed = false;
                  broadcastToRoom(data.roomId, {
                    type: 'room_state_update',
                    room,
                  });
                }
              }, 2500);
            }
          } else {
            // Secret choice made
            broadcastToRoom(data.roomId, {
              type: 'room_state_update',
              room,
            });
          }
        }
        return;
      }

      if (data.type === 'request_rematch') {
        const room = rooms.get(data.roomId);
        if (!room || !meta.playerId) return;

        if (room.rematchRequestedBy && room.rematchRequestedBy !== meta.playerId) {
          // Opponent already requested rematch, this acts as acceptance!
          resetGameForRematch(room);
        } else {
          room.rematchRequestedBy = meta.playerId;
        }

        broadcastToRoom(data.roomId, {
          type: 'room_state_update',
          room,
        });
        return;
      }

      if (data.type === 'accept_rematch') {
        const room = rooms.get(data.roomId);
        if (!room) return;
        resetGameForRematch(room);
        broadcastToRoom(data.roomId, {
          type: 'room_state_update',
          room,
        });
        return;
      }

      if (data.type === 'switch_game') {
        const room = rooms.get(data.roomId);
        if (!room) return;
        room.gameType = data.gameType;
        resetGameForRematch(room);
        broadcastToRoom(data.roomId, {
          type: 'room_state_update',
          room,
        });
        return;
      }

      if (data.type === 'send_reaction') {
        const room = rooms.get(data.roomId);
        if (!room) return;
        const sender =
          room.player1.id === meta.playerId
            ? room.player1.name
            : (room.player2 && room.player2.id === meta.playerId)
            ? room.player2.name
            : 'Spectator';

        broadcastToRoom(data.roomId, {
          type: 'reaction',
          emoji: data.emoji,
          fromPlayer: sender,
          timestamp: Date.now(),
        });
        return;
      }

      if (data.type === 'turn_timeout') {
        const room = rooms.get(data.roomId);
        if (!room || room.winState.winner !== null) return;

        const timedOutPlayer =
          room.currentTurn === 'player1' ? room.player1.name : (room.player2?.name || 'Player 2');
        const nextTurn = room.currentTurn === 'player1' ? 'player2' : 'player1';
        const nextPlayer =
          nextTurn === 'player1' ? room.player1.name : (room.player2?.name || 'Player 2');

        room.currentTurn = nextTurn;
        room.turnStartTime = Date.now();
        room.moveHistory.push(
          `⏱️ Time ran out for ${timedOutPlayer}! Chance passed to ${nextPlayer}.`
        );

        broadcastToRoom(data.roomId, {
          type: 'room_state_update',
          room,
        });
        return;
      }
    } catch (err) {
      console.error('WS message error:', err);
    }
  });

  ws.on('close', () => {
    const meta = clients.get(ws);
    if (meta && meta.roomId) {
      const room = rooms.get(meta.roomId);
      if (room) {
        if (room.player2 && room.player2.id === meta.playerId) {
          room.player2 = null;
          broadcastToRoom(meta.roomId, {
            type: 'room_state_update',
            room,
          });
        }
      }
    }
    clients.delete(ws);
  });
});

// Periodic ping to keep alive and clean stale clients
setInterval(() => {
  for (const [ws, meta] of clients.entries()) {
    if (!meta.isAlive) {
      ws.terminate();
      clients.delete(ws);
    } else {
      meta.isAlive = false;
      ws.ping();
    }
  }
}, 30000);

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, connectedClients: clients.size });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

// Serve frontend in dev or prod
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 ArenaPlay server running on port ${PORT}`);
  });
}

startServer();
