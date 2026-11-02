import { useEffect, useMemo, useState } from 'react';
import vimPuzzleImage from './assets/VIM_PUZZLE.png';
import './App.css';

const GRID_SIZE = 4;
const EMPTY_TILE = 0;
const SOLVED_BOARD = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => (index + 1) % (GRID_SIZE * GRID_SIZE));
const EMOJIS = ['🎉', '🎊', '✨', '🏆', '👏', '🥳', '🔥'];

const createShuffledBoard = () => {
  let board = [...SOLVED_BOARD];
  let emptyIndex = board.indexOf(EMPTY_TILE);

  for (let i = 0; i < 200; i += 1) {
    const neighbors = getMovableIndices(emptyIndex, board);
    const nextIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[emptyIndex], board[nextIndex]] = [board[nextIndex], board[emptyIndex]];
    emptyIndex = nextIndex;
  }

  if (isSolved(board)) {
    return createShuffledBoard();
  }

  return board;
};

const getMovableIndices = (emptyIndex, board) => {
  const row = Math.floor(emptyIndex / GRID_SIZE);
  const col = emptyIndex % GRID_SIZE;
  const validMoves = [];

  if (row > 0) validMoves.push(emptyIndex - GRID_SIZE);
  if (row < GRID_SIZE - 1) validMoves.push(emptyIndex + GRID_SIZE);
  if (col > 0) validMoves.push(emptyIndex - 1);
  if (col < GRID_SIZE - 1) validMoves.push(emptyIndex + 1);

  return validMoves.filter((index) => board[index] !== EMPTY_TILE || index !== emptyIndex);
};

const isSolved = (board) => board.every((value, index) => value === SOLVED_BOARD[index]);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

function App() {
  const [board, setBoard] = useState(() => createShuffledBoard());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerName, setPlayerName] = useState('Player');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const emptyIndex = board.indexOf(EMPTY_TILE);

  const celebrationBurst = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        emoji: EMOJIS[index % EMOJIS.length],
        left: `${Math.random() * 100}%`,
        delay: `${(index % 8) * 0.12}s`,
        duration: `${2.2 + (index % 10) * 0.22}s`,
      })),
    [board]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying && isLoggedIn) {
        setSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isLoggedIn]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('/api/scores');
        const data = await response.json();
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchScores();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowCelebration(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !isSolved(board)) return;

    setIsPlaying(false);
    setShowCelebration(true);

    const saveScore = async () => {
      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: playerName.trim() || 'Player',
            moves,
            time: seconds,
          }),
        });

        const result = await response.json();
        if (result.leaderboard) {
          setLeaderboard(result.leaderboard);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    };

    saveScore();
  }, [board, moves, seconds, playerName, isLoggedIn]);

  const handleTileClick = (index) => {
    if (!isPlaying || !isLoggedIn) return;

    const neighbors = getMovableIndices(emptyIndex, board);
    if (!neighbors.includes(index)) return;

    const newBoard = [...board];
    [newBoard[emptyIndex], newBoard[index]] = [newBoard[index], newBoard[emptyIndex]];

    setBoard(newBoard);
    setMoves((prev) => prev + 1);
  };

  const resetGame = () => {
    setBoard(createShuffledBoard());
    setMoves(0);
    setSeconds(0);
    setIsPlaying(true);
    setShowCelebration(false);
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError('Please enter a username and password.');
      return;
    }

    setPlayerName(loginForm.username.trim());
    setLoginError('');
    setIsLoggedIn(true);
    resetGame();
  };

  const handleQuit = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setBoard(createShuffledBoard());
    setMoves(0);
    setSeconds(0);
    setIsPlaying(true);
    setShowCelebration(false);
  };

  const isWinning = isSolved(board);

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">
        <div className="login-card">
          <div className="login-header">
            <span className="login-badge">VIM PUZZLE</span>
            <h1>Welcome</h1>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              <span>Username</span>
              <input
                type="text"
                value={loginForm.username}
                onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
                placeholder="Enter username"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="Enter password"
              />
            </label>

            {loginError && <p className="error-text">{loginError}</p>}

            <button type="submit" className="login-btn">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="vim-app">
      <div className="game-shell">
        <div className="game-panel">
          <div className="topbar">
            <div className="mini-label">VIM PUZZLE</div>
            <div className="top-actions">
              <button className="secondary-btn" onClick={resetGame}>New Game</button>
              <button className="quit-btn" onClick={handleQuit}>Quit</button>
            </div>
          </div>

          <div className="title-wrap">
            <h1 className="hero-title">
              <span className="title-top">VIM</span>
              <span className="title-bottom">PUZZLE</span>
            </h1>
            <div className="crown" aria-hidden="true">👑</div>
          </div>

          <div className="divider" />

          <div className="stats-row">
            <div className="stat-box">
              <span>Moves</span>
              <strong>{moves}</strong>
            </div>
            <div className="stat-box">
              <span>Time</span>
              <strong>{formatTime(seconds)}</strong>
            </div>
            <div className="stat-box status-box">
              <span>Status</span>
              <strong>{isWinning ? 'Solved!' : isPlaying ? 'Playing' : 'Paused'}</strong>
            </div>
          </div>

          <label className="name-input">
            <span>Player name</span>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value.slice(0, 20))}
              placeholder="Player"
            />
          </label>

          <div className="board-wrapper">
            <div className="board" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
              {board.map((tile, index) => (
                <button
                  key={tile === EMPTY_TILE ? 'empty' : `${tile}-${index}`}
                  className={`tile ${tile === EMPTY_TILE ? 'empty' : ''}`}
                  onClick={() => handleTileClick(index)}
                  disabled={tile === EMPTY_TILE || !isPlaying}
                >
                  {tile === EMPTY_TILE ? '' : tile}
                </button>
              ))}
            </div>

            {showCelebration && (
              <div className="celebration-overlay" aria-live="polite">
                <div className="celebration-burst">
                  {celebrationBurst.map((item) => (
                    <span
                      key={item.id}
                      className="confetti"
                      style={{
                        left: item.left,
                        animationDelay: item.delay,
                        animationDuration: item.duration,
                      }}
                    >
                      {item.emoji}
                    </span>
                  ))}
                </div>
                <div className="congrats-box">CONGRATULATIONS!</div>
              </div>
            )}
          </div>
        </div>

        <aside className="side-panel">
          <div className="image-card">
            <img src={vimPuzzleImage} alt="VIM puzzle artwork" className="visual-art" />
          </div>

          <div className="leaderboard-panel">
            <h2>Leaderboard</h2>
            <ul>
              {leaderboard.length === 0 ? (
                <li className="empty-state">No scores yet</li>
              ) : (
                leaderboard.map((entry, index) => (
                  <li key={`${entry.name}-${entry.moves}-${entry.time}-${index}`}>
                    <span>
                      #{index + 1} {entry.name}
                    </span>
                    <strong>
                      {entry.moves} moves · {formatTime(entry.time)}
                    </strong>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
