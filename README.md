# VIM PUZZLE

**Slide. Solve. Win.**

A full-stack sliding puzzle game built with React, Node.js, Express and MongoDB. VIM PUZZLE combines classic number puzzles with a custom gaming interface, player statistics, victory effects and a persistent global leaderboard.

![VIM PUZZLE](client/src/assets/VIM%20Puzzle_%20Slide%2C%20Solve%2C%20Win.png)

## Features

- Three difficulty levels: 3 × 3 (Easy), 4 × 4 (Medium) and 5 × 5 (Hard).
- Solvable randomized boards generated through legal tile movements.
- Real-time move counter, elapsed timer and game status.
- Player profiles and locally stored personal records.
- Global top-10 leaderboard for 4 × 4 puzzles, ranked by fewest moves and then shortest completion time.
- Persistent score storage using MongoDB Atlas, with an in-memory demo fallback when the database is disconnected.
- Victory confetti, synthesized victory sound and animated golden trophy.
- Responsive blue-and-gold interface with custom branding and reduced-motion support for victory effects.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, JavaScript, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| API | REST, JSON |
| Animation and audio | canvas-confetti, CSS animations, Web Audio API |
| Development | npm, Nodemon, Concurrently, Git, GitHub |

## Architecture

```mermaid
flowchart LR
    A[React game interface] -->|HTTP / JSON| B[Express REST API]
    B --> C[Mongoose]
    C --> D[(MongoDB Atlas)]
    B -. Database disconnected .-> E[In-memory scores]
    A --> F[Local personal records]
```

The React client manages puzzle state, legal moves, timing and victory detection. Completed 4 × 4 games submit scores to the Express API. The backend stores scores through Mongoose and retrieves the ranked leaderboard from MongoDB when connected.

## Getting Started

### Prerequisites

- Node.js and npm (use a version supported by the project's Vite dependency)
- Git
- A MongoDB Atlas account and cluster, or a local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/Vimeth22/VIM_PUZZLE.git
cd VIM_PUZZLE
```

### 2. Install dependencies

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Configure environment variables

From the project root, create a local environment file:

```bash
cp .env.example .env
```

Update `.env` with your own MongoDB connection string:

```dotenv
PORT=5001
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/vim_puzzle?retryWrites=true&w=majority
```

For Atlas, configure a database user and allow your development machine's IP address under Network Access. URL-encode special characters in database credentials when necessary.

Never commit your actual `.env` file or database credentials. The `.env.example` file contains placeholders only.

### 4. Start the application

```bash
npm run dev
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:4175 |
| Backend | http://localhost:5001 |
| Scores API | http://localhost:5001/api/scores |

### 5. Build the frontend

```bash
cd client
npm run build
```

The production frontend output is generated in `client/dist/`.

## How to Play

1. Enter a player name using the demo login screen.
2. Select a difficulty level.
3. Click a numbered tile adjacent to the empty space to move it.
4. Arrange the tiles in ascending numerical order, leaving the empty space in the bottom-right corner.
5. Complete a 4 × 4 puzzle to submit a score to the global leaderboard.
6. Select **Play Again** or **New Game** to start another puzzle.

## REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/scores` | Retrieve the top 10 scores |
| POST | `/api/scores` | Submit a completed puzzle score |

Example request body:

```json
{
  "name": "PlayerOne",
  "moves": 58,
  "time": 126
}
```

Time is measured in seconds. Scores are sorted by ascending move count, with elapsed time as the tie-breaker.

A successful submission returns HTTP `201 Created` with the saved score and updated leaderboard. When MongoDB is disconnected, the demo fallback stores scores in server memory; these scores do not survive a server restart.

## Project Structure

```text
VIM_PUZZLE/
├── client/
│   ├── src/
│   │   ├── assets/          # Branding and game artwork
│   │   ├── App.jsx          # Game logic and interface
│   │   ├── App.css          # Component styling and animations
│   │   └── index.css        # Global styling
│   └── package.json
├── server/
│   ├── src/
│   │   ├── models/         # Mongoose score model
│   │   └── routes/
│   │       └── scoreRoutes.js
│   ├── index.js            # Server entry point
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Testing and Validation

The following checks were performed manually during development:

- Completed puzzles and verified move counts and completion times.
- Verified victory sound and the solved-game interface.
- Tested score submission through the REST API.
- Confirmed game scores were stored in MongoDB Atlas.
- Restarted the application and verified that saved scores remained visible.
- Tested the shared leaderboard using different player names.
- Verified leaderboard ordering by move count.
- Successfully built the frontend with Vite.

## Current Limitations and Future Improvements

This project is a portfolio application. The login is demo-based rather than secure account authentication. Personal records are local to the browser, and the global leaderboard currently supports 4 × 4 puzzles only. Scores are submitted by the client and are not independently verified by the server.

Planned improvements include:

- Secure user registration and authentication.
- Server-side score verification and stronger input validation.
- Global leaderboards for every difficulty level.
- Automated unit, integration and end-to-end tests.
- Optimized image assets and public deployment.

## Author

**Vimeth Jayawardana** — Full-Stack Software Developer

[GitHub](https://github.com/Vimeth22) · [Project repository](https://github.com/Vimeth22/VIM_PUZZLE)

---

**VIM PUZZLE — Challenge Your Mind!**
