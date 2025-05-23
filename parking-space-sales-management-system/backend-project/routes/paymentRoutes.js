const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/', isAuthenticated, paymentController.createPayment);
router.get('/', isAuthenticated, paymentController.getAllPayments);
router.delete('/:id', isAuthenticated, paymentController.deletePayment);

module.exports = router;
