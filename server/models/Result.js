const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    username: {
      type: String,
      required: true,
      default: 'Anonymous'
    },
    wpm: {
      type: Number,
      required: [true, 'WPM is required'],
      min: 0,
      max: 400
    },
    rawWpm: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      required: [true, 'Accuracy is required'],
      min: 0,
      max: 100
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required']
    },
    language: {
      type: String,
      required: true,
      enum: ['python', 'javascript', 'java', 'cpp'],
      default: 'python'
    },
    mode: {
      type: String,
      required: true,
      enum: ['snippet', 'time', 'words'],
      default: 'snippet'
    },
    modeDetail: {
      type: String,
      default: 'default'
    },
    keystrokes: {
      total: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying on leaderboards and user profiles
resultSchema.index({ wpm: -1, accuracy: -1 });
resultSchema.index({ user: 1, createdAt: -1 });
resultSchema.index({ language: 1, wpm: -1 });

module.exports = mongoose.model('Result', resultSchema);
