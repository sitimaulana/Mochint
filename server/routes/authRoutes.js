const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);

// OTP and Password routes for Google OAuth users
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/set-password', authController.setPassword);

// Google OAuth routes - lazy load passport only when needed
router.get('/google', (req, res, next) => {
  try {
    const passport = require('../config/passport');
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth not configured:', error.message);
    res.redirect('http://103.185.38.61/login?error=google_not_configured');
  }
});

router.get('/google/callback', (req, res, next) => {
  try {
    const passport = require('../config/passport');
    passport.authenticate('google', { 
      failureRedirect: 'http://103.185.38.61/login?error=google_auth_failed',
      session: false 
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth callback error:', error.message);
    res.redirect('http://103.185.38.61/login?error=google_callback_error');
  }
}, authController.googleCallback);

module.exports = router;