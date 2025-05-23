// controllers/dashboardController.js
const { promise } = require('../db');

exports.getDashboardSummary = async (req, res) => {
  try {
    const [[{ totalSlots }]] = await promise.query('SELECT COUNT(*) AS totalSlots FROM ParkingSlot');
    const [[{ occupiedSlots }]] = await promise.query("SELECT COUNT(*) AS occupiedSlots FROM ParkingRecord WHERE ExitTime IS NULL");
    const [[{ totalCarsToday }]] = await promise.query("SELECT COUNT(*) AS totalCarsToday FROM ParkingRecord WHERE DATE(EntryTime) = CURDATE()");
    const [[{ totalRevenue }]] = await promise.query("SELECT SUM(AmountPaid) AS totalRevenue FROM Payment WHERE DATE(PaymentDate) = CURDATE()");

    res.json({
      totalSlots,
      occupiedSlots,
      totalCarsToday,
      totalRevenue: totalRevenue || 0
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
};
