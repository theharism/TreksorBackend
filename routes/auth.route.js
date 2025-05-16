const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authenticationMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/request-reset-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/check-auth', authenticate, authController.checkAuth);
router.get('/logout', authController.logout);
router.get('/stripe/connect', authenticate ,authController.stripeConnect);
router.get('/stripe/callback',authController.stripeCallback);

module.exports = router;