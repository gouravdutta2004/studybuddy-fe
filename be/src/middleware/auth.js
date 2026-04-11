const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Routes always accessible regardless of shadow-ban or pending status
const ALWAYS_ALLOW = [
  '/api/auth/me',
  '/api/compliance',   // GDPR: export & delete-account must always work
  '/api/moderation/my-status', // user can always check their own status
  '/api/push',         // push subscription management
];

// Routes blocked for shadow-banned users (social/discovery surface)
const SHADOWBAN_BLOCK = [
  '/api/users/search',
  '/api/users/matches',
  '/api/users/connect',
  '/api/users/accept',
  '/api/sessions',
  '/api/rooms',
  '/api/groups',
];

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id).select('-password');
    } else {
      req.user = await User.findById(decoded.id).select('-password');
    }
    
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    if (decoded.role === 'admin') {
      req.user.role = 'admin';
    }

    const path = req.originalUrl.split('?')[0];
    const isAlwaysAllowed = ALWAYS_ALLOW.some(p => path.startsWith(p));

    // ── Walled Garden: block PENDING users ──
    const isPendingAllowed = isAlwaysAllowed ||
      path.startsWith('/api/users/profile') ||
      path.startsWith('/api/kyc/verify');
    if (req.user.verificationStatus === 'PENDING' && !isPendingAllowed) {
      return res.status(403).json({ message: 'Account strictly pending organizational approval.' });
    }

    // ── Shadow-ban: covertly block social routes ──
    // Banned users still receive 200-OK on write attempts but data is silently dropped.
    // On read/discovery routes we return an empty payload so they don't notice the ban.
    if (req.user.isShadowBanned && !isAlwaysAllowed) {
      const isBlocked = SHADOWBAN_BLOCK.some(p => path.startsWith(p));
      if (isBlocked) {
        // Return empty data silently (shadow effect — user thinks it worked)
        if (req.method === 'GET') return res.json([]);
        return res.json({ message: 'Action recorded' }); // silent no-op for writes
      }
    }

    // ── Add privacy headers to every authenticated response ──
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token expired, please log in again'
      : 'Not authorized, token failed';
    return res.status(401).json({ message });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const isOrgAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ORG_ADMIN' || req.user.role === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Organization Admin' });
  }
};

module.exports = { protect, admin, isOrgAdmin };
