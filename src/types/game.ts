export type GameType = 'connect4' | 'tictactoe' | 'rps';

export type GameMode = 'local' | 'online' | 'ai';

export type PlayerColor = 'red' | 'yellow' | 'blue' | 'green';

export interface PlayerInfo {
  id: string;
  name: string;
  color: PlayerColor;
  symbol?: 'X' | 'O';
  isReady?: boolean;
  score: number;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type WinState = {
  winner: 'player1' | 'player2' | 'draw' | null;
  winningCells?: [number, number][]; // row, col for C4, or index for TTT
  winningLine?: number[]; // indices for TTT
  streak?: number;
};

// Connect Four: 6 rows, 7 columns
// Board representation: board[row][col] where row 0 is top, row 5 is bottom
// 0 = empty, 1 = player 1, 2 = player 2
export type Connect4Board = number[][];

// Tic Tac Toe: array of 9 cells (0..8)
// null | 'X' | 'O'
export type TTTBoard = (string | null)[];

// Rock Paper Scissors choice
export type RPSChoice = 'rock' | 'paper' | 'scissors' | null;

export interface RPSRound {
  p1Choice: RPSChoice;
  p2Choice: RPSChoice;
  winner: 'player1' | 'player2' | 'draw' | null;
}

export interface GameRoomState {
  roomId: string;
  gameType: GameType;
  gameMode: GameMode;
  player1: PlayerInfo;
  player2: PlayerInfo | null;
  spectators: PlayerInfo[];
  currentTurn: 'player1' | 'player2';
  turnStartTime: number;
  timeLimit: number; // in seconds, 0 = unlimited
  
  // Game specific state
  connect4: {
    board: Connect4Board;
    lastDrop?: { row: number; col: number; player: number };
  };
  tictactoe: {
    board: TTTBoard;
    lastMove?: number;
  };
  rps: {
    rounds: RPSRound[];
    p1CurrentChoice: RPSChoice;
    p2CurrentChoice: RPSChoice;
    revealed: boolean;
    bestOf: number;
  };

  winState: WinState;
  rematchRequestedBy: string | null;
  moveHistory: string[];
}

export type WSClientMessage =
  | { type: 'join_room'; roomId: string; playerName: string; preferredColor?: PlayerColor }
  | { type: 'create_room'; gameType: GameType; playerName: string; preferredColor?: PlayerColor; timeLimit?: number }
  | { type: 'make_move'; roomId: string; moveData: any }
  | { type: 'request_rematch'; roomId: string }
  | { type: 'accept_rematch'; roomId: string }
  | { type: 'send_reaction'; roomId: string; emoji: string }
  | { type: 'switch_game'; roomId: string; gameType: GameType }
  | { type: 'leave_room'; roomId: string }
  | { type: 'turn_timeout'; roomId: string }
  | { type: 'ping' };

export type WSServerMessage =
  | { type: 'room_joined'; room: GameRoomState; yourRole: 'player1' | 'player2' | 'spectator'; playerId: string }
  | { type: 'room_state_update'; room: GameRoomState }
  | { type: 'reaction'; emoji: string; fromPlayer: string; timestamp: number }
  | { type: 'error'; message: string }
  | { type: 'pong' };

export interface GameStats {
  gamesPlayed: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  currentStreak: { player: string; count: number };
}
