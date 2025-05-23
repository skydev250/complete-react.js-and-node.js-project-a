const { promise } = require('../db');

// Create Parking Record
exports.createRecord = async (req, res) => {
  const { PlateNumber, SlotNumber, EntryTime } = req.body;
  try {
    await promise.query(
      'INSERT INTO ParkingRecord (PlateNumber, SlotNumber, EntryTime) VALUES (?, ?, ?)',
      [PlateNumber, SlotNumber, EntryTime]
    );

    // Update SlotStatus
    await promise.query(
      'UPDATE ParkingSlot SET SlotStatus = "Occupied" WHERE SlotNumber = ?',
      [SlotNumber]
    );

    res.status(201).json({ message: 'Parking record created successfully' });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Read all records
exports.getRecords = async (req, res) => {
  try {
    const [records] = await promise.query(`
      SELECT pr.*, c.DriverName, ps.SlotStatus 
      FROM ParkingRecord pr
      JOIN Car c ON pr.PlateNumber = c.PlateNumber
      JOIN ParkingSlot ps ON pr.SlotNumber = ps.SlotNumber
      ORDER BY pr.RecordID DESC
    `);
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Parking Record
exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  const { PlateNumber, SlotNumber, EntryTime } = req.body;
  try {
    await promise.query(
      'UPDATE ParkingRecord SET PlateNumber = ?, SlotNumber = ?, EntryTime = ? WHERE RecordID = ?',
      [PlateNumber, SlotNumber, EntryTime, id]
    );
    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Parking Record
exports.deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const [[record]] = await promise.query('SELECT SlotNumber FROM ParkingRecord WHERE RecordID = ?', [id]);
    await promise.query('DELETE FROM ParkingRecord WHERE RecordID = ?', [id]);

    // Free up the slot
    await promise.query(
      'UPDATE ParkingSlot SET SlotStatus = "Available" WHERE SlotNumber = ?',
      [record.SlotNumber]
    );

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Exit Parking - update ExitTime and Duration
exports.exitParking = async (req, res) => {
  const { id } = req.params;
  const exitTime = new Date();

  try {
    const [[record]] = await promise.query('SELECT EntryTime, SlotNumber FROM ParkingRecord WHERE RecordID = ?', [id]);

    if (!record) return res.status(404).json({ message: 'Record not found' });

    const entryTime = new Date(record.EntryTime);
    const duration = Math.ceil((exitTime - entryTime) / (1000 * 60)); // in minutes

    await promise.query(
      'UPDATE ParkingRecord SET ExitTime = ?, Duration = ? WHERE RecordID = ?',
      [exitTime, duration, id]
    );

    await promise.query(
      'UPDATE ParkingSlot SET SlotStatus = "Available" WHERE SlotNumber = ?',
      [record.SlotNumber]
    );

    res.json({ message: 'Exit recorded successfully', exitTime, duration });
  } catch (error) {
    console.error('Error during exit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
