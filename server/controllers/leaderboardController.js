const Result = require('../models/Result');

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const { language, mode, limit = 50 } = req.query;

    const query = {};
    if (language && language !== 'all') {
      query.language = language;
    }
    if (mode && mode !== 'all') {
      query.mode = mode;
    }

    const results = await Result.find(query)
      .sort({ wpm: -1, accuracy: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'username email');

    const ranked = results.map((item, index) => ({
      rank: index + 1,
      _id: item._id,
      username: item.user?.username || item.username || 'Anonymous',
      wpm: item.wpm,
      accuracy: item.accuracy,
      timeTaken: item.timeTaken,
      language: item.language,
      mode: item.mode,
      date: item.createdAt
    }));

    res.json({
      success: true,
      count: ranked.length,
      data: ranked
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard
};
