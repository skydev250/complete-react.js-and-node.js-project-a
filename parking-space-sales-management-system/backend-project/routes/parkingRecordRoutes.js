const express = require('express');
const router = express.Router();
const controller = require('../controllers/parkingRecordController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/', isAuthenticated, controller.createRecord);
router.get('/', isAuthenticated, controller.getRecords);
router.put('/:id', isAuthenticated, controller.updateRecord);
router.delete('/:id', isAuthenticated, controller.deleteRecord);
router.post('/exit/:id', isAuthenticated, controller.exitParking);

module.exports = router;
