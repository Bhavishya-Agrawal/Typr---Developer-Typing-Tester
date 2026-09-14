const express = require('express');
const router = express.Router();
const { saveResult, getMyResults, getMyStats } = require('../controllers/resultController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, saveResult);
router.get('/my-history', protect, getMyResults);
router.get('/my-stats', protect, getMyStats);

module.exports = router;
