const Snippet = require('../models/Snippet');

// @desc    Get random snippet by language & bucket/mode
// @route   GET /api/snippets/random
// @access  Public
const getRandomSnippet = async (req, res, next) => {
  try {
    const { language = 'python', bucket = 'words30', mode = 'snippet', targetWords } = req.query;

    if (mode === 'time') {
      // For time mode, return 2 or 3 snippets combined or an array of snippets
      const snippets = await Snippet.aggregate([
        { $match: { language } },
        { $sample: { size: 3 } }
      ]);

      if (!snippets.length) {
        return res.status(404).json({ success: false, message: `No snippets found for language: ${language}` });
      }

      const combinedText = snippets.map((s) => s.code).join('\n\n');
      return res.json({
        success: true,
        data: {
          code: combinedText,
          language,
          mode: 'time'
        }
      });
    }

    // Snippet or Words mode
    let matchQuery = { language };
    if (bucket && ['words30', 'words50', 'words100'].includes(bucket)) {
      matchQuery.bucket = bucket;
    }

    const snippets = await Snippet.aggregate([
      { $match: matchQuery },
      { $sample: { size: 1 } }
    ]);

    if (!snippets.length) {
      // Fallback: match any snippet for this language
      const fallback = await Snippet.aggregate([
        { $match: { language } },
        { $sample: { size: 1 } }
      ]);

      if (!fallback.length) {
        return res.status(404).json({ success: false, message: `No snippets found for language: ${language}` });
      }

      return res.json({
        success: true,
        data: fallback[0]
      });
    }

    res.json({
      success: true,
      data: snippets[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available languages and snippet stats
// @route   GET /api/snippets/stats
// @access  Public
const getSnippetStats = async (req, res, next) => {
  try {
    const stats = await Snippet.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          buckets: { $addToSet: '$bucket' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRandomSnippet,
  getSnippetStats
};
