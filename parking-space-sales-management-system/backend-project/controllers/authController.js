const bcrypt = require('bcrypt');
const { promise } = require('../db');

// Register a new user
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [userExists] = await promise.query('SELECT * FROM users WHERE username = ?', [username]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await promise.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [userResult] = await promise.query('SELECT * FROM users WHERE username = ?', [username]);
    if (userResult.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = userResult[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.user = { id: user.id, username: user.username };
    res.json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout user
exports.logout = (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ message: 'No user is logged in' });
  }

  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    // Ensure cookie name matches session middleware cookie name
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
  });
};

// Get current user session
exports.getCurrentUser = (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
