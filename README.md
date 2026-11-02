# VIM PUZZLE 

A full-stack sliding puzzle game built with:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB (optional, falls back to in-memory scores)

This project includes:
- Login screen before entering the game
- 4x4 sliding number puzzle
- Move/time tracking
- Leaderboard (top 10)
- Win celebration with a big **CONGRATULATIONS** message + emoji rain
- Quit button to return to login

---

## 1) Prerequisites

Install these first:

- **Node.js** (recommended: v18+)
- **npm** (comes with Node.js)
- **MongoDB** (optional, only needed for persistent leaderboard)

Check versions:

```bash
node -v
npm -v
```

---

## 2) Project Structure

```text
ReactN/
├─ client/                 # React app (Vite)
├─ server/                 # Express API
│  ├─ index.js
│  └─ src/
│     ├─ models/Score.js
│     └─ routes/scoreRoutes.js
├─ .env.example
├─ package.json            # Root scripts for running both client/server
└─ README.md
```

> Note: If you see an extra folder like `server/server/`, it is not required for the main app run flow.

---

## 3) Install Dependencies

From project root:

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

---

## 4) Environment Setup

Create `.env` in root (or copy from `.env.example`):

```bash
cp .env.example .env
```

Then set values:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/sliding-puzzle
```

- `PORT`: backend server port
- `MONGO_URI`: MongoDB connection string

If `MONGO_URI` is missing/unreachable, the app still works in **demo mode** (scores saved in memory only).

---

## 5) Run the App (Development)

From root:

```bash
npm run dev
```

This starts:
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:4175`

Open in browser:

```text
http://localhost:4175
```

---

## 6) How Login Works

Current login is a simple local UI gate (no JWT/auth database yet):

- Enter any **non-empty username and password**
- Click **Login**
- You enter the game screen
- Click **Quit** to return to login page

---

## 7) Available Scripts

### Root (`package.json`)

```bash
npm run dev      # run backend + frontend together
npm run server   # run backend with nodemon
npm run client   # run frontend (vite)
npm run build    # build frontend for production
npm run start    # run backend in normal mode
```

### Client (`client/package.json`)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 8) API Endpoints

Base URL:

```text
http://localhost:5001/api
```

### Health Check

```http
GET /health
```

### Get Leaderboard

```http
GET /scores
```

### Save Score

```http
POST /scores
Content-Type: application/json

{
  "name": "Player",
  "moves": 42,
  "time": 120
}
```

#### Example with curl

```bash
curl http://localhost:5001/api/scores

curl -X POST http://localhost:5001/api/scores \
  -H "Content-Type: application/json" \
  -d '{"name":"Vimeth","moves":30,"time":95}'
```

---

## 9) Build for Production

Build frontend assets:

```bash
npm run build
```

Run backend:

```bash
npm run start
```

---

## 10) Troubleshooting

### A) Port already in use

If `4175` or `5001` is busy, stop existing processes and retry:

```bash
pkill -f "vite|nodemon|node index.js"
npm run dev
```

### B) MongoDB connection issues

- Ensure MongoDB is running locally
- Verify `MONGO_URI` in `.env`
- If not available, app falls back to demo mode automatically

### C) Browser says connection refused

- Confirm terminal shows Vite and Express started
- Open exact frontend URL printed in terminal (normally `http://localhost:4175`)

---

## 11) Gameplay Notes

- Solve the puzzle by ordering numbers 1–15
- Empty tile can be moved by clicking adjacent tiles
- On solve:
  - Big **CONGRATULATIONS!** overlay appears
  - Emoji rain animation plays
  - Score is posted to leaderboard

---

## 12) GitHub

Repository:

```text
https://github.com/Vimeth22/VIM_PUZZLE
```

To push future updates:

```bash
git add .
git commit -m "your message"
git push origin main
```
