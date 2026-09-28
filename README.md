# 🎮 ArenaPlay

### One Arena. Three Games. Endless Fun.

ArenaPlay is a browser-based gaming platform that brings classic games together in one interactive experience. Play against friends locally, challenge an AI opponent, or connect with other players online through multiplayer rooms.

Featuring **Connect Four, Tic-Tac-Toe, and Rock Paper Scissors**, ArenaPlay combines engaging gameplay, real-time interactions, customizable game settings, and a playful interface to create a fun digital gaming arena.

---

## ✨ Features

### 🎯 Three Classic Games

ArenaPlay brings three familiar games into one platform.

- **Connect Four:** Drop colored discs into a 6 × 7 grid and connect four discs horizontally, vertically, or diagonally to win.
- **Tic-Tac-Toe:** Play the classic 3 × 3 grid game. Be the first to align three symbols horizontally, vertically, or diagonally.
- **Rock Paper Scissors:** Challenge your opponent in a best-of-three match. Choose your move, reveal the results, and compete to win the match.

### 🕹️ Multiple Game Modes

Choose how you want to play:

- **Local Mode:** Play with a friend on the same device using pass-and-play.
- **Play vs. AI:** Challenge a computer opponent with adjustable difficulty levels.
- **Online Multiplayer:** Create a private game room and invite friends using a unique room code.

### 🤖 AI Opponent

Practice your skills against an AI opponent with three difficulty levels:

- **Easy:** A more relaxed opponent with randomized decisions and occasional tactical moves.
- **Medium:** An opponent that considers winning opportunities, blocks threats, and uses strategic moves.
- **Hard:** A more advanced opponent using search algorithms to evaluate possible moves.

The AI uses game-specific logic, including Minimax for Tic-Tac-Toe and depth-limited Minimax with alpha-beta pruning for Connect Four.

### 🌐 Online Multiplayer

Play with friends remotely using real-time communication.

- Create and join multiplayer rooms.
- Share a unique room code with friends.
- Synchronize game states between connected players.
- Support for spectators when a room already has two players.
- Send emoji reactions during online matches.
- Request rematches and switch games.
- Track player turns and match progress.

### ⏱️ Interactive Gameplay

- Configurable turn timers.
- Automatic turn passing when the timer expires.
- Move history to follow the game.
- Win and draw detection.
- Winning-line highlighting where applicable.
- Restart and rematch functionality.
- Undo support for applicable local games.
- Player scores and game statistics.

### 🎨 User Experience

ArenaPlay is designed to make casual gaming engaging and intuitive.

- Responsive, browser-based interface.
- Animated game interactions.
- Playful visual elements and cartoon-inspired backgrounds.
- Sound effects with a mute option.
- Floating emoji reactions.
- Rules and statistics modals.
- Keyboard shortcuts for common actions.

---

## 🛠️ Tech Stack

ArenaPlay uses a modern TypeScript-based web stack.

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Type-safe application development |
| Vite | Frontend development and build tooling |
| Tailwind CSS 4 | Utility-first styling |
| Express.js | Backend HTTP server and API endpoints |
| WebSocket (`ws`) | Real-time multiplayer communication |
| Node.js | Server-side JavaScript runtime |
| Motion | UI animations |
| Lucide React | Interface icons |
| Canvas Confetti | Celebration effects |
| Google GenAI SDK | Google Generative AI integration dependency |

---

## 🏗️ Project Architecture

ArenaPlay follows a component-based architecture, with separate modules for the user interface, game logic, AI opponents, and multiplayer communication.

The React frontend manages the interface and player interactions, while the Express and WebSocket server handles online game rooms and broadcasts state updates to connected clients.

```text
ArenaPlay/
│
├── index.html
├── package.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── server.ts
├── .env.example
├── .gitignore
│
└── src/
    │
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    │
    ├── components/
    │   ├── CartoonBackground.tsx
    │   ├── ConnectFourBoard.tsx
    │   ├── EmojiReactions.tsx
    │   ├── GameStatusBanner.tsx
    │   ├── Header.tsx
    │   ├── ModeSelector.tsx
    │   ├── PlayerCard.tsx
    │   ├── RockPaperScissorsArena.tsx
    │   ├── RulesModal.tsx
    │   ├── StatsModal.tsx
    │   └── TicTacToeBoard.tsx
    │
    ├── hooks/
    │   └── useMultiplayer.ts
    │
    ├── types/
    │   └── game.ts
    │
    └── utils/
        ├── aiOpponent.ts
        ├── audio.ts
        └── gameLogic.ts
```

### Key Modules

| File / Directory | Description |
|---|---|
| `src/App.tsx` | Main application component and UI integration |
| `src/components/` | Reusable UI components and game boards |
| `src/hooks/useMultiplayer.ts` | Game state, game modes, and multiplayer interactions |
| `src/types/game.ts` | Shared TypeScript types and game-state interfaces |
| `src/utils/gameLogic.ts` | Core game rules, move validation, and win detection |
| `src/utils/aiOpponent.ts` | AI decision-making algorithms |
| `src/utils/audio.ts` | Sound effects and audio controls |
| `server.ts` | Express server, WebSocket connections, and online room management |

---

## 🚀 Getting Started

Follow these steps to run ArenaPlay locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) — a current version compatible with the project's dependencies.
- npm — included with Node.js.
- Git — to clone the repository.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ArenaPlay.git
```

Navigate into the project directory:

```bash
cd ArenaPlay
```

Replace `YOUR_USERNAME` with your GitHub username or the repository owner's username.

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Alternatively, if you use Bun:

```bash
bun install
```

### 3. Configure Environment Variables

The repository includes an `.env.example` file.

Create a local `.env` file if your deployment or integrations require environment variables:

```bash
cp .env.example .env
```

The example file contains the following variables:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
APP_URL=YOUR_APP_URL
```

**Important:**

- Only configure API keys if the corresponding integration requires them.
- Never commit real API keys, credentials, or other secrets to version control.
- The example values are placeholders, not working credentials.
- `APP_URL` should point to your deployed application when required.

### 4. Start the Development Server

Run:

```bash
npm run dev
```

This starts the application through the TypeScript server entry point.

Open the local URL printed in your terminal to access ArenaPlay.

### 5. Build for Production

To create a production frontend build, run:

```bash
npm run build
```

The generated frontend assets are placed in the `dist/` directory.

### 6. Run the Application

To start the server using the production start script:

```bash
npm start
```

The server uses port `3000` by default, unless a different port is specified through the `PORT` environment variable.

---

## 🎮 How to Play

### Connect Four

1. Select Connect Four from the available games.
2. Choose a game mode.
3. Take turns dropping discs into the columns.
4. Connect four discs horizontally, vertically, or diagonally.
5. The first player to achieve this wins.

### Tic-Tac-Toe

1. Select Tic-Tac-Toe.
2. Choose your preferred game mode.
3. Players alternate placing X and O on the 3 × 3 board.
4. Align three matching symbols to win.
5. If all nine cells are filled without a winning line, the game ends in a draw.

### Rock Paper Scissors

1. Select Rock Paper Scissors.
2. Choose a game mode and start the match.
3. Select rock, paper, or scissors.
4. Compare the revealed choices.
5. The winner of each round earns a point.
6. The first player to win two rounds wins the best-of-three match.

**Rules:**
- Rock beats scissors.
- Scissors beats paper.
- Paper beats rock.
- Matching choices result in a draw.

---

## ⌨️ Keyboard Shortcuts

ArenaPlay supports keyboard shortcuts for selected actions.

| Shortcut | Action |
|---|---|
| `M` | Toggle sound |
| `?` | Open or close the rules modal |
| `Z` | Undo the last move when supported |
| `R` | Restart or request a rematch for applicable games |
| `Esc` | Close open modals |

Shortcuts that modify the game are subject to the current game mode and availability of the action.

---

## 🌐 Multiplayer

ArenaPlay uses WebSockets to enable real-time communication between players.

### Creating a Room

1. Select Online Multiplayer.
2. Choose a game.
3. Enter your player name and configure the available settings.
4. Create a room.
5. Share the generated room code with your opponent.

### Joining a Room

1. Select the online game option.
2. Enter the room code.
3. Enter your player name.
4. Join the room and wait for the game to begin.

ArenaPlay also supports joining a room through a URL containing a room query parameter.

Example:

```text
https://your-domain.com/?room=ROOMID
```

Replace `your-domain.com` and `ROOMID` with the actual deployment URL and room code.

### Multiplayer Server

The backend provides the following HTTP endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Returns server health and connection statistics |
| `/api/rooms/:id` | GET | Returns the current state of a room |
| `/ws` | WebSocket | Handles real-time multiplayer communication |

The health endpoint returns information such as server status, active rooms, and connected clients.

**Note:** Room data is stored in server memory. Rooms are not persisted in a database, so restarting the server clears the active room state.

---

## 🧠 AI Implementation

ArenaPlay includes game-specific AI algorithms.

### Tic-Tac-Toe

The AI supports three difficulty levels:

- Easy: Randomized moves with occasional attempts to take a winning move.
- Medium: Prioritizes winning moves, attempts to block the human player, and considers the center cell.
- Hard: Uses the Minimax algorithm to evaluate possible game outcomes.

### Connect Four

The Connect Four AI combines immediate tactical checks with search-based decision-making.

- Checks for an immediate winning move.
- Attempts to block an opponent's winning move.
- Uses a center-column preference.
- Applies depth-limited Minimax with alpha-beta pruning.
- Evaluates board positions using a heuristic scoring function.

The search depth varies by difficulty, allowing the game to offer different levels of challenge.

---

## 📊 Game Statistics

ArenaPlay includes a statistics interface for viewing game performance.

The application tracks statistics such as:

- Games played.
- Player wins.
- Draws.
- Current winning streak.

Statistics are stored locally in the browser using `localStorage`, so they are associated with the current browser environment rather than a centralized user account.

Clearing browser storage or using another browser may result in different statistics.

---

## 🔒 Security and Configuration

When running or deploying ArenaPlay, keep the following considerations in mind:

- Keep API keys and secrets out of source control.
- Configure environment variables through your deployment platform's secret-management settings.
- Use HTTPS and secure WebSocket connections (`wss://`) in production.
- Configure appropriate origin and connection controls before exposing the multiplayer server publicly.
- Treat in-memory multiplayer rooms as temporary.
- Do not assume that locally stored statistics are synchronized across devices.

The current implementation is intended as a lightweight gaming application. A production deployment with untrusted users may require additional server-side validation, rate limiting, room lifecycle management, and stronger multiplayer authorization.

---

## 🧪 Available Scripts

The following scripts are defined in `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Starts the TypeScript server using `tsx` |
| `npm run build` | Builds the frontend using Vite |
| `npm start` | Starts the server using `tsx` |
| `npm run preview` | Starts the Vite preview server |
| `npm run lint` | Runs the TypeScript compiler in no-emit mode |
| `npm run clean` | Removes the generated `dist` directory and `server.js` |

Run the TypeScript check with:

```bash
npm run lint
```

---

## 🔮 Future Enhancements

Potential improvements for future versions include:

- Persistent player profiles and leaderboards.
- Database-backed game history and statistics.
- Private rooms with stronger access controls.
- Improved matchmaking and room discovery.
- Additional board games and multiplayer challenges.
- Reconnection support for interrupted online matches.
- More advanced AI strategies and difficulty customization.
- Enhanced accessibility and keyboard navigation.
- Mobile-first UI refinements.
- Automated unit and integration tests.

---

## 📄 License

This project includes source files marked with the Apache License 2.0 identifier.

For a complete licensing statement, refer to the repository's license file, if provided. Ensure that all third-party dependencies and assets are used in accordance with their respective licenses.

---

## 👩‍💻 Author

**Stuti Verma**

- GitHub: [@sv8587](https://github.com/sv8587)
- LinkedIn: [Stuti Verma](https://www.linkedin.com/in/stuti-a-verma/)
