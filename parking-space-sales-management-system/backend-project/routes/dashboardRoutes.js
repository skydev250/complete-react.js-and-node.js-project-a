// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

// Protected route to get dashboard summary
router.get('/summary', isAuthenticated, getDashboardSummary);

module.exports = router;
