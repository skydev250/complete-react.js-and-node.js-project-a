const { promise: db } = require('../db');

// Add a new parking slot
const addSlot = async (req, res) => {
  const { SlotNumber, SlotStatus } = req.body;

  if (!SlotNumber) {
    return res.status(400).json({ message: 'SlotNumber is required' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [SlotNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Slot already exists' });
    }

    await db.query(
      'INSERT INTO ParkingSlot (SlotNumber, SlotStatus) VALUES (?, ?)',
      [SlotNumber, SlotStatus || 'Available']
    );

    res.status(201).json({ message: 'Parking slot added successfully' });
  } catch (error) {
    console.error('Error adding slot:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all parking slots
const getAllSlots = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ParkingSlot ORDER BY SlotNumber');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addSlot,
  getAllSlots,
};
