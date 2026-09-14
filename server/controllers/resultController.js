const Result = require('../models/Result');

// @desc    Save typing test result
// @route   POST /api/results
// @access  Public (optional auth attaches user ID)
const saveResult = async (req, res, next) => {
  try {
    const {
      wpm,
      rawWpm,
      accuracy,
      timeTaken,
      language,
      mode,
      modeDetail,
      keystrokes
    } = req.body;

    if (wpm === undefined || accuracy === undefined || timeTaken === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required test metrics' });
    }

    const resultData = {
      wpm: Number(wpm),
      rawWpm: rawWpm ? Number(rawWpm) : Number(wpm),
      accuracy: Number(accuracy),
      timeTaken: Number(timeTaken),
      language: language || 'python',
      mode: mode || 'snippet',
      modeDetail: modeDetail || 'default',
      keystrokes: keystrokes || { total: 0, correct: 0, incorrect: 0 }
    };

    if (req.user) {
      resultData.user = req.user._id;
      resultData.username = req.user.username;
    } else {
      resultData.username = req.body.username || 'Guest Typist';
    }

    const result = await Result.create(resultData);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's test history
// @route   GET /api/results/my-history
// @access  Private
const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's aggregate typing statistics
// @route   GET /api/results/my-stats
// @access  Private
const getMyStats = async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user._id }).sort({ createdAt: 1 });

    if (!results.length) {
      return res.json({
        success: true,
        data: {
          totalTests: 0,
          bestWpm: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          totalTime: 0,
          languageCounts: {},
          recentTrend: []
        }
      });
    }

    const totalTests = results.length;
    let totalWpm = 0;
    let totalAcc = 0;
    let bestWpm = 0;
    let totalTime = 0;
    const languageCounts = { python: 0, javascript: 0, java: 0, cpp: 0 };

    results.forEach((r) => {
      totalWpm += r.wpm;
      totalAcc += r.accuracy;
      if (r.wpm > bestWpm) bestWpm = r.wpm;
      totalTime += r.timeTaken || 0;
      if (languageCounts[r.language] !== undefined) {
        languageCounts[r.language]++;
      }
    });

    const avgWpm = Math.round(totalWpm / totalTests);
    const avgAccuracy = Math.round(totalAcc / totalTests);

    // Recent trend (last 15 tests)
    const recentTrend = results.slice(-15).map((r) => ({
      date: r.createdAt,
      wpm: r.wpm,
      accuracy: r.accuracy,
      language: r.language
    }));

    res.json({
      success: true,
      data: {
        totalTests,
        bestWpm,
        avgWpm,
        avgAccuracy,
        totalTime,
        languageCounts,
        recentTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveResult,
  getMyResults,
  getMyStats
};
