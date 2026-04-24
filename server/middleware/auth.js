const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ success: false, error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'mochint_secret_key', (err, payload) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = payload;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
  }
};

module.exports = authenticateToken;
module.exports.isAdmin = isAdmin;
module.exports.authenticateToken = authenticateToken;