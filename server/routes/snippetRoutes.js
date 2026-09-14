const express = require('express');
const router = express.Router();
const { getRandomSnippet, getSnippetStats } = require('../controllers/snippetController');

router.get('/random', getRandomSnippet);
router.get('/stats', getSnippetStats);

module.exports = router;
