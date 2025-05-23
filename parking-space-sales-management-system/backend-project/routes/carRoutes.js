const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/', isAuthenticated, carController.addCar);       // POST /api/cars
router.get('/', isAuthenticated, carController.getAllCars);    // GET /api/cars

module.exports = router;
