const express = require('express');
const Score = require('../models/Score');

const router = express.Router();
const inMemoryScores = [];

const getSortedScores = async () => {
  if (mongooseConnected()) {
    const scores = await Score.find({}).sort({ moves: 1, time: 1 }).limit(10).lean();
    return scores.map((score) => ({
      _id: score._id,
      name: score.name,
      moves: score.moves,
      time: score.time,
      createdAt: score.createdAt,
    }));
  }

  return [...inMemoryScores].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
};

const mongooseConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

router.get('/scores', async (req, res) => {
  try {
    const scores = await getSortedScores();
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load scores.', error: error.message });
  }
});

router.post('/scores', async (req, res) => {
  try {
    const { name, moves, time } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Player name is required.' });
    }

    if (typeof moves !== 'number' || typeof time !== 'number') {
      return res.status(400).json({ message: 'Moves and time are required numbers.' });
    }

    const scoreEntry = {
      name: name.trim().slice(0, 30),
      moves,
      time,
      createdAt: new Date().toISOString(),
    };

    if (mongooseConnected()) {
      const createdScore = await Score.create({
        name: scoreEntry.name,
        moves: scoreEntry.moves,
        time: scoreEntry.time,
      });

      const scores = await getSortedScores();
      return res.status(201).json({ message: 'Score saved', score: createdScore, leaderboard: scores });
    }

    inMemoryScores.push(scoreEntry);
    const leaderboard = await getSortedScores();
    return res.status(201).json({ message: 'Score saved in demo mode', score: scoreEntry, leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Unable to save score.', error: error.message });
  }
});

module.exports = router;
