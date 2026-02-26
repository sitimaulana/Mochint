const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);

// Google OAuth routes - lazy load passport only when needed
router.get('/google', (req, res, next) => {
  try {
    const passport = require('../config/passport');
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth not configured:', error.message);
    res.redirect('http://localhost:5173/login?error=google_not_configured');
  }
});

router.get('/google/callback', (req, res, next) => {
  try {
    const passport = require('../config/passport');
    passport.authenticate('google', { 
      failureRedirect: 'http://localhost:5173/login?error=google_auth_failed',
      session: false 
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth callback error:', error.message);
    res.redirect('http://localhost:5173/login?error=google_callback_error');
  }
}, authController.googleCallback);

module.exports = router;