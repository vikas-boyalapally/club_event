const jwt = require('jsonwebtoken');

const ROLE_MODELS = {
  student: require('../models/Student'),
  staff: require('../models/Staff'),
  admin: require('../models/Admin')
};

async function authenticate(req, res, next) {
  const authorization = req.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured.');

    const payload = jwt.verify(authorization.slice(7), secret);
    const Model = ROLE_MODELS[payload.role];
    if (!Model) return res.status(401).json({ error: 'Invalid authentication token.' });

    const user = await Model.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
    req.user = { id: user._id.toString(), role: payload.role, record: user };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    next(error);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
