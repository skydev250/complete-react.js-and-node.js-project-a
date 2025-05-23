// controllers/reportController.js
const { promise } = require('../db');

exports.getDailyReport = async (req, res) => {
  try {
    // Query total parking records grouped by entry date
    const [parkingRows] = await promise.query(`
      SELECT DATE(EntryTime) AS reportDate, COUNT(*) AS totalParkingRecords
      FROM ParkingRecord
      GROUP BY reportDate
      ORDER BY reportDate DESC
    `);

    // Query total payments grouped by payment date
    const [paymentRows] = await promise.query(`
      SELECT PaymentDate AS reportDate, 
             IFNULL(SUM(AmountPaid), 0) AS totalPayments
      FROM Payment
      GROUP BY PaymentDate
      ORDER BY PaymentDate DESC
    `);

    // Map payments by date for easy lookup
    const paymentsMap = {};
    for (const payment of paymentRows) {
      paymentsMap[payment.reportDate.toISOString().slice(0, 10)] = payment.totalPayments;
    }

    // Combine parking and payment data
    const combinedReports = parkingRows.map(row => {
      const dateStr = row.reportDate.toISOString().slice(0, 10);
      return {
        reportDate: dateStr,
        totalParkingRecords: row.totalParkingRecords,
        totalPayments: paymentsMap[dateStr] || 0
      };
    });

    // If there are payments for dates with no parking records, add them as well
    const parkingDates = new Set(parkingRows.map(r => r.reportDate.toISOString().slice(0, 10)));
    paymentRows.forEach(payment => {
      const dateStr = payment.reportDate.toISOString().slice(0, 10);
      if (!parkingDates.has(dateStr)) {
        combinedReports.push({
          reportDate: dateStr,
          totalParkingRecords: 0,
          totalPayments: payment.totalPayments
        });
      }
    });

    // Sort descending by date
    combinedReports.sort((a, b) => (a.reportDate < b.reportDate ? 1 : -1));

    res.json(combinedReports);
  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({ message: 'Failed to fetch daily report' });
  }
};
