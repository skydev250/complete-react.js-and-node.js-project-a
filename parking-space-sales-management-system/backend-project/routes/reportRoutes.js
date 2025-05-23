
const express = require('express');
const router = express.Router();
const { getDailyReport } = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/daily', isAuthenticated, getDailyReport);

module.exports = router;
