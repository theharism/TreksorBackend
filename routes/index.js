const express = require('express');
const { authenticate } = require('../middlewares/authenticationMiddleware');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/stripe', express.raw({ type: 'application/json' }), require('./webhook.route'));
router.use('/stripe/billing', require('./billing.route'));
router.use('/stripe/insights', authenticate, require('./insights.route'));
router.use('/user', authenticate, require('./user.route'));

module.exports = router;