const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    moves: {
      type: Number,
      required: true,
      min: 0,
    },
    time: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Score || mongoose.model('Score', scoreSchema);
