const jwt = require('jsonwebtoken');
const { users } = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'agri-supply-secret-key';
const JWT_EXPIRES = '7d';

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied. Required: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, generateToken, JWT_SECRET };