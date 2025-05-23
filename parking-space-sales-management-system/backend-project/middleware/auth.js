// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // User is authenticated, proceed
  } else {
    return res.status(401).json({ message: 'Unauthorized: Please log in first' });
  }
};

module.exports = { isAuthenticated };
