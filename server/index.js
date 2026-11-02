require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const scoreRoutes = require('./src/routes/scoreRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sliding Puzzle API is running.' });
});

app.use('/api', scoreRoutes);

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MONGO_URI not set. Running in demo mode without database storage.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    console.log('Starting server in demo mode without MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
};

startServer();
