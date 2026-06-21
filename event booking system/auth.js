const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'event-booking-secret-key-2024';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user is an organizer
function requireOrganizer(req, res, next) {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can access this resource' });
  }
  next();
}

// Middleware to check if user is a customer
function requireCustomer(req, res, next) {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can access this resource' });
  }
  next();
}

// Generate JWT token
function generateToken(userId, email, role) {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  authenticateToken,
  requireOrganizer,
  requireCustomer,
  generateToken,
  JWT_SECRET
};
