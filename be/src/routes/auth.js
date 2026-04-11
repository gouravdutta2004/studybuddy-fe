const router = require('express').Router();
const { register, login, getMe, forgotPassword, resetPassword, changePassword, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Brute-force protection: max 10 attempts per IP per 15 minutes on sensitive auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts from this IP, please try again after 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed requests toward the limit
});

router.post('/register', authLimiter, register);
router.get('/organizations', require('../controllers/authController').getOrganizations);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/password', protect, changePassword);

module.exports = router;
