const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { otpLimiter } = require('../middlewares/rateLimitingMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/third-party', authController.signInWithThirdParty);
router.post('/request-otp', otpLimiter, authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/request-reset-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authController.logout);

module.exports = router;