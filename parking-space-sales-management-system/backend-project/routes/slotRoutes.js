const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/', isAuthenticated, slotController.addSlot);     // Add new slot
router.get('/', isAuthenticated, slotController.getAllSlots);  // Get all slots

module.exports = router;
