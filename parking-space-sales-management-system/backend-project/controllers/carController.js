const { promise } = require('../db');

// Add a new car
exports.addCar = async (req, res) => {
  const { PlateNumber, DriverName, PhoneNumber } = req.body;

  if (!PlateNumber || !DriverName || !PhoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existing] = await promise.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Car with this Plate Number already exists' });
    }

    await promise.query(
      'INSERT INTO Car (PlateNumber, DriverName, PhoneNumber) VALUES (?, ?, ?)',
      [PlateNumber, DriverName, PhoneNumber]
    );

    res.status(201).json({ message: 'Car added successfully' });
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const [cars] = await promise.query('SELECT * FROM Car ORDER BY PlateNumber DESC');
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
