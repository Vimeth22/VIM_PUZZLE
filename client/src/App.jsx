
/* ========================================
   VIM PUZZLE - PREMIUM GAMING EDITION
======================================== */


/* ========================================
   1. IMPORTS
======================================== */

import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

import {
  ArrowLeftRight,
  Timer,
  Gamepad2,
  User,
  BarChart3,
  Trophy,
  Target,
  Pencil,
  Play,
  Power,
  RotateCcw,
  Crown
} from 'lucide-react';

import vimPuzzleImage from './assets/VIM Puzzle_ Slide, Solve, Win.png';
import vimPuzzleLogo from './assets/VIM_PUZZLE_LOGO.png';
import vimPuzzleTrophy from './assets/VIM_PUZZLE_TROPHY.png';
import vimPuzzleAvatar from './assets/VIM_PUZZLE_AVATAR.png';
import './App.css';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';


/* ========================================
   2. PUZZLE GENERATION AND GAME ALGORITHMS
======================================== */

// Generate a completed puzzle board

const solved = (n) =>
  Array.from(
    { length: n * n },
    (_, i) => (i + 1) % (n * n)
  );


// Check whether the puzzle is solved

const isSolved = (b) =>
  b.every(
    (v, i) => v === (i + 1) % b.length
  );


// Find valid neighboring tiles

function neighbors(i, n) {
  const r = Math.floor(i / n);
  const c = i % n;

  return [
    r > 0 ? i - n : -1,
    r < n - 1 ? i + n : -1,
    c > 0 ? i - 1 : -1,
    c < n - 1 ? i + 1 : -1
  ].filter((x) => x >= 0);
}


// Generate a randomized solvable puzzle

function shuffle(n) {
  let b = solved(n);
  let e = b.indexOf(0);
  let last = -1;

  do {
    for (let i = 0; i < 200; i++) {
      const options = neighbors(e, n).filter(
        (x) => x !== last
      );

      const k =
        options[
          Math.floor(Math.random() * options.length)
        ];

      [b[e], b[k]] = [b[k], b[e]];

      last = e;
      e = k;
    }
  } while (isSolved(b));

  return b;
}


/* ========================================
   3. TIME FORMATTING
======================================== */

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(
    s % 60
  ).padStart(2, '0')}`;


/* ========================================
   4. PLAYER RECORDS AND LOCAL STORAGE
======================================== */

const emptyRecord = {
  bestTime: null,
  bestMoves: null,
  games: 0
};


// Retrieve saved personal records

function readRecords() {
  try {
    return (
      JSON.parse(
        localStorage.getItem('vim-records-v1')
      ) || {}
    );
  } catch {
    return {};
  }
}


/* ========================================
   5. REUSABLE STATISTICS COMPONENT
======================================== */

function Stat({
  icon: Icon,
  label,
  value,
  extra = ''
}) {
  return (
    <div className={`stat-box ${extra}`}>
      <Icon aria-hidden="true" />

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* ==================================
   5.1 VICTORY CONFETTI ANIMATION
================================== */

function launchVictoryConfetti() {

  const colors = [
    '#FFD700',
    '#FFC107',
    '#FFF1A0',
    '#FFFFFF',
    '#00D9FF'
  ];

  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    startVelocity: 45,
    scalar: 1.2,
    zIndex: 9999,
    disableForReducedMotion: true
  });

  confetti({
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.7 },
    colors,
    zIndex: 9999,
    disableForReducedMotion: true
  });

  confetti({
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.7 },
    colors,
    zIndex: 9999,
    disableForReducedMotion: true
  });

}

/* ==================================
   5.2. VICTORY SOUND EFFECT
================================== */

async function playVictorySound() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const audioContext = new AudioContext();

    await audioContext.resume();

    const notes = [
      523.25,
      659.25,
      783.99,
      1046.50,
      783.99,
      1046.50,
      1318.51
    ];

    const startTime = audioContext.currentTime;

    notes.forEach((frequency, index) => {

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      const start = startTime + index * 0.15;

      oscillator.type = 'triangle';

      oscillator.frequency.setValueAtTime(
        frequency,
        start
      );

      gain.gain.setValueAtTime(0.001, start);

      gain.gain.exponentialRampToValueAtTime(
        0.15,
        start + 0.03
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        start + 0.4
      );

      oscillator.connect(gain);

      gain.connect(audioContext.destination);

      oscillator.start(start);

      oscillator.stop(start + 0.4);

      if (index === notes.length - 1) {
        oscillator.onended = () => {
          audioContext.close().catch(() => {});
        };
      }

    });

  } catch (error) {

    console.warn(
      'Victory sound could not be played:',
      error
    );

  }

}

/* ========================================
   6. MAIN APPLICATION COMPONENT
======================================== */

export default function App() {

  /* ======================================
     6.1. GAME STATE
  ====================================== */

  const [size, setSize] = useState(4);

  const [board, setBoard] = useState(
    () => shuffle(4)
  );

  const [moves, setMoves] = useState(0);

  const [seconds, setSeconds] = useState(0);

  const [started, setStarted] = useState(false);


  /* ======================================
     6.2. PLAYER AND LEADERBOARD STATE
  ====================================== */

  const [playerName, setPlayerName] =
    useState('Player');

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [records, setRecords] =
    useState(readRecords);


  /* ======================================
     6.3. LOGIN STATE
  ====================================== */

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [loginError, setLoginError] =
    useState('');


  /* ======================================
     6.4. SCORE SUBMISSION STATE
  ====================================== */

  const [scoreStatus, setScoreStatus] =
    useState('');


  /* ======================================
     6.5. REACT REFERENCES
  ====================================== */

  const submitted = useRef(false);

  const nameInput = useRef(null);

  const startTime = useRef(0);


  /* ======================================
     6.6. DERIVED GAME VALUES
  ====================================== */

  const winning = isSolved(board);

  const name = playerName.trim() || 'Player';

  const recordKey = JSON.stringify([
    name.toLowerCase(),
    size
  ]);

  const record =
    records[recordKey] || emptyRecord;


  /* ======================================
     7. GAME TIMER
  ====================================== */

  useEffect(() => {
    if (!isLoggedIn || !started || winning) {
      return;
    }

    const id = setInterval(() => {
      setSeconds(
        Math.floor(
          (Date.now() - startTime.current) / 1000
        )
      );
    }, 250);

    return () => clearInterval(id);

  }, [isLoggedIn, started, winning]);


  /* ======================================
     8. FETCH GLOBAL LEADERBOARD
  ====================================== */

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/scores`)

      .then((r) => {
        if (!r.ok) {
          throw Error('Scores unavailable');
        }

        return r.json();
      })

      .then((d) => {
        setLeaderboard(
          Array.isArray(d) ? d : []
        );
      })

      .catch(() => {
        setScoreStatus(
          'Leaderboard unavailable.'
        );
      });

  }, []);


  /* ======================================
     9. SAVE COMPLETED GAME RESULTS
  ====================================== */

  useEffect(() => {
    if (
      !isLoggedIn ||
      !winning ||
      submitted.current
    ) {
      return;
    }

    // Prevent duplicate score submissions

    submitted.current = true;


    // Update personal performance records

    const next = {
      ...records,

      [recordKey]: {
        games: record.games + 1,

        bestTime: Math.min(
          record.bestTime ?? Infinity,
          seconds
        ),

        bestMoves: Math.min(
          record.bestMoves ?? Infinity,
          moves
        )
      }
    };

    setRecords(next);


    // Save personal records locally

    try {
      localStorage.setItem(
        'vim-records-v1',
        JSON.stringify(next)
      );
    } catch {
      setScoreStatus(
        'Local records could not be saved.'
      );
    }


    // Submit 4 × 4 scores to the backend

    if (size === 4) {
      fetch(`${API_BASE_URL}/api/scores`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          name,
          moves,
          time: seconds
        })
      })

        .then((r) => {
          if (!r.ok) {
            throw Error('Save failed');
          }

          return r.json();
        })

        .then((d) => {
          if (Array.isArray(d.leaderboard)) {
            setLeaderboard(d.leaderboard);
          }
        })

        .catch(() => {
          setScoreStatus(
            'Global score could not be saved.'
          );
        });
    }

  }, [
    winning,
    isLoggedIn,
    records,
    recordKey,
    record,
    moves,
    seconds,
    size,
    name
  ]);


  /* ======================================
     10. RESET GAME
  ====================================== */

  function resetGame(n = size) {
    submitted.current = false;

    setSize(n);
    setBoard(shuffle(n));
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setScoreStatus('');
  }


  /* ======================================
     11. HANDLE PUZZLE TILE MOVEMENT
  ====================================== */

  function move(i) {

    // Prevent movement after completing the game

    if (winning || !isLoggedIn) {
      return;
    }


    // Locate the empty tile

    const e = board.indexOf(0);


    // Validate the selected tile

    if (!neighbors(e, size).includes(i)) {
      return;
    }


    // Start the timer on the first valid move

    if (!started) {
      startTime.current = Date.now();

      setStarted(true);
    }


    // Move the selected tile

    const b = [...board];

    [b[e], b[i]] = [b[i], b[e]];

    setBoard(b);

    setMoves((m) => m + 1);


       // Record the final completion time

    if (isSolved(b)) {
      setSeconds(
        Math.floor(
          (Date.now() - startTime.current) / 1000
        )
      );

      // Launch victory confetti animation

      launchVictoryConfetti();

      // Play victory sound effect

      void playVictorySound();
    }
  }


  /* ======================================
     12. PLAYER LOGIN
  ====================================== */

  function login(e) {
    e.preventDefault();


    // Validate login fields

    if (
      !loginForm.username.trim() ||
      !loginForm.password.trim()
    ) {
      setLoginError(
        'Enter a username and password.'
      );

      return;
    }


    // Initialize the player session

    setPlayerName(
      loginForm.username.trim().slice(0, 20)
    );

    setLoginError('');

    setIsLoggedIn(true);

    resetGame(4);
  }


  /* ======================================
     13. QUIT GAME
  ====================================== */

  function quit() {
    setIsLoggedIn(false);

    setLoginForm({
      username: '',
      password: ''
    });

    resetGame(4);
  }


  /* ======================================
     14. LOGIN PAGE
  ====================================== */

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">

      <div className="login-card">
        <img
            src={vimPuzzleLogo}
            alt="VIM PUZZLE"
            className="login-logo"
        />

  <p className="login-subtitle">
    Welcome to the challenge
  </p>

          {/* Login Form */}

          <form
            className="login-form"
            onSubmit={login}
          >

            {/* Username */}

            <label>
              Username

              <input
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    username: e.target.value
                  })
                }
                maxLength={20}
              />
            </label>


            {/* Password */}

            <label>
              Password (demo only)

              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password: e.target.value
                  })
                }
              />
            </label>


            {/* Login Error */}

            {loginError && (
              <p className="error-text">
                {loginError}
              </p>
            )}


            {/* Login Button */}

            <button className="secondary-btn">
              Login
            </button>

          </form>

          <small>
            Demo login — use a non-sensitive password.
          </small>

        </div>

      </div>
    );
  }


  /* ======================================
     15. MAIN GAME DASHBOARD
  ====================================== */

  return (
    <main className="vim-app">

      <div className="game-shell">


        {/* ==================================
            16. MAIN GAME PANEL
        ================================== */}

        <section className="game-panel glass">


          {/* Top Navigation */}

          <header className="topbar">

            <span className="mini-label">
              VIM PUZZLE
            </span>

            <div className="top-actions">

              <button
                className="secondary-btn"
                onClick={() => resetGame()}
              >
                <Play />
                New Game
              </button>

              <button
                className="quit-btn"
                onClick={quit}
              >
                <Power />
                Quit
              </button>

            </div>

          </header>


          {/* ==================================
              17. PREMIUM GAME LOGO
          ================================== */}
          <div className="title-wrap">
            <img
              src={vimPuzzleLogo}
              alt="VIM PUZZLE — Slide · Solve · Win"
              className="premium-logo"
            />
          </div>

          {/* ==================================
              18. LIVE GAME STATISTICS
          ================================== */}

          <div className="stats-row">

            <Stat
              icon={ArrowLeftRight}
              label="Moves"
              value={moves}
            />

            <Stat
              icon={Timer}
              label="Time"
              value={formatTime(seconds)}
            />

            <Stat
              icon={Gamepad2}
              label="Status"
              value={
                winning
                  ? 'Solved!'
                  : started
                    ? 'Playing'
                    : 'Ready'
              }
              extra="status-box"
            />

          </div>


          {/* ==================================
              19. GAME CONTROLS
          ================================== */}

          <div className="game-controls">


            {/* Player Name */}

            <label>

              <User />

              <span>Player name</span>

              <input
                ref={nameInput}
                value={playerName}
                maxLength={20}
                disabled={started || winning}
                onChange={(e) =>
                  setPlayerName(e.target.value)
                }
              />

            </label>


            {/* Difficulty Selection */}

            <label>

              <BarChart3 />

              <span>Difficulty</span>

              <select
                value={size}
                onChange={(e) =>
                  resetGame(Number(e.target.value))
                }
              >

                <option value={3}>
                  3 × 3 (Easy)
                </option>

                <option value={4}>
                  4 × 4 (Medium)
                </option>

                <option value={5}>
                  5 × 5 (Hard)
                </option>

              </select>

            </label>

          </div>


          {/* ==================================
              20. PUZZLE PLAY AREA
          ================================== */}

          <div className="play-area">


            {/* Puzzle Board */}

            <div className="board-wrapper">

              <div
                className="board"
                style={{
                  gridTemplateColumns:
                    `repeat(${size}, minmax(0, 1fr))`
                }}
              >

                {board.map((tile, i) => (

                  <button
                    key={tile}

                    className={
                      `tile ${tile === 0 ? 'empty' : ''}`
                    }

                    disabled={!tile || winning}

                    aria-label={
                      tile
                        ? `Move tile ${tile}`
                        : 'Empty space'
                    }

                    onClick={() => move(i)}
                  >

                    {tile || ''}

                  </button>

                ))}

              </div>

            </div>


            {/* ==================================
                21. VICTORY AND CHALLENGE CARD
            ================================== */}

            <section
              className={
                `victory-card ${winning ? 'won' : ''}`
              }
              aria-live="polite"
            >

            <img
                src={vimPuzzleTrophy}
                alt="VIM Puzzle Golden Trophy"
                className="premium-trophy"
            />


              {/* Challenge Heading */}

              <h2>
                {
                  winning
                    ? 'PUZZLE SOLVED!'
                    : 'THE CHALLENGE'
                }
              </h2>


              {/* Challenge Description */}

              <p>
                {
                  winning
                    ? 'Congratulations!'
                    : 'Slide the tiles into numerical order.'
                }
              </p>


              {/* Completion Time */}

              <div className="result-line">

                <Timer />

                Time

                <strong>
                  {formatTime(seconds)}
                </strong>

              </div>


              {/* Total Moves */}

              <div className="result-line">

                <ArrowLeftRight />

                Moves

                <strong>
                  {moves}
                </strong>

              </div>


              {/* Restart Game Button */}

              <button
                className="gold-btn"
                onClick={() => resetGame()}
              >

                <RotateCcw />

                {
                  winning
                    ? 'Play Again'
                    : 'New Puzzle'
                }

              </button>

            </section>

          </div>

        </section>


        {/* ==================================
            22. RIGHT SIDEBAR
        ================================== */}

        <aside className="side-panel">


          {/* ==================================
              23. VIM PUZZLE COVER IMAGE
          ================================== */}

          <div className="image-card glass">

            <img
              src={vimPuzzleImage}
              alt="VIM Puzzle — Challenge your mind"
            />

          </div>


          {/* ==================================
              24. PLAYER PROFILE
          ================================== */}

          <section className="profile-panel glass">

            <h2>
              <User />
              Player Profile
            </h2>


            {/* Player Information */}

            <div className="profile-main">


              {/* Player Avatar */}

              <div className="avatar">
            <img
                src={vimPuzzleAvatar}
                alt="VIM Puzzle Player Avatar"
                className="player-avatar"
              />
            </div>


              {/* Player Name */}

              <div className="profile-name">

                <strong>
                  {name}
                </strong>

                <small>
                  Puzzle Enthusiast
                </small>

              </div>


              {/* Edit Profile Button */}

              <button
                className="edit-btn"
                disabled={started || winning}
                onClick={() =>
                  nameInput.current?.focus()
                }
              >

                <Pencil />

                Edit

              </button>

            </div>


            {/* ==================================
                25. PERSONAL PERFORMANCE RECORDS
            ================================== */}

            <div className="personal-stats">

              <Stat
                icon={Trophy}
                label="Best Time"
                value={
                  record.bestTime === null
                    ? '—'
                    : formatTime(record.bestTime)
                }
              />

              <Stat
                icon={Target}
                label="Best Moves"
                value={record.bestMoves ?? '—'}
              />

              <Stat
                icon={BarChart3}
                label="Games Played"
                value={record.games}
              />

            </div>


            {/* Difficulty Information */}

            <small className="note">
              Local records · {size} × {size}
            </small>

          </section>


          {/* ==================================
              26. GLOBAL LEADERBOARD
          ================================== */}

          <section className="leaderboard-panel glass">

            <h2>

              <Trophy />

              Leaderboard

              <small>
                4 × 4 · All time
              </small>

            </h2>


            {/* Leaderboard Table */}

            <div className="ranking-scroll">

              <table>


                {/* Table Headings */}

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Time</th>
                    <th>Moves</th>
                  </tr>

                </thead>


                {/* Leaderboard Entries */}

                <tbody>

  {leaderboard.length ? (

    leaderboard.map((entry, i) => {

      const isCurrentPlayer =
        entry.name?.toLowerCase() === name.toLowerCase();

      return (

        <tr
          key={`${entry.name}-${i}`}
          className={`ranking-row rank-${i + 1} ${
            isCurrentPlayer ? 'current-player' : ''
          }`}
        >

          {/* Premium Ranking Crown */}

          <td>
            <div className="rank-badge">

              {i < 3 && <Crown size={18} />}

              <span>{i + 1}</span>

            </div>
          </td>


          {/* Player Name */}

          <td>
            <div className="ranking-player">

              <span>{entry.name}</span>

              {isCurrentPlayer && (
                <span className="you-badge">
                  YOU
                </span>
              )}

            </div>
          </td>


          {/* Completion Time */}

          <td>
            {formatTime(entry.time)}
          </td>


          {/* Total Moves */}

          <td>
            {entry.moves}
          </td>

        </tr>

      );

    })

  ) : (

    <tr>

      <td colSpan={4} className="ranking-empty">

        <Trophy size={28} />

        <span>No scores yet</span>

        <small>
          Complete a puzzle to claim your rank!
        </small>

      </td>

    </tr>

  )}

</tbody>

              </table>

            </div>


            {/* Score Submission Status */}

            {scoreStatus && (

              <p
                className="note"
                role="status"
              >
                {scoreStatus}
              </p>

            )}

          </section>

        </aside>

      </div>

    </main>
  );
}


/* ========================================
   END OF VIM PUZZLE APPLICATION
======================================== */
