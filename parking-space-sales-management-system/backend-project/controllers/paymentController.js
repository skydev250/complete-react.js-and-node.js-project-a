const { promise: db } = require('../db');

// Create a payment
exports.createPayment = async (req, res) => {
  const { RecordID, AmountPaid, PaymentDate } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO Payment (RecordID, AmountPaid, PaymentDate) VALUES (?, ?, ?)',
      [RecordID, AmountPaid, PaymentDate]
    );
    res.status(201).json({ message: 'Payment recorded successfully', PaymentID: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.PaymentID, p.RecordID, c.PlateNumber, c.DriverName, pr.EntryTime, pr.ExitTime,
             p.AmountPaid, p.PaymentDate
      FROM Payment p
      JOIN ParkingRecord pr ON p.RecordID = pr.RecordID
      JOIN Car c ON pr.PlateNumber = c.PlateNumber
      ORDER BY p.PaymentDate DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM Payment WHERE PaymentID = ?', [id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete payment' });
  }
};
