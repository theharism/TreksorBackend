const express = require('express');
const { authenticate } = require('../middlewares/authenticationMiddleware');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/user', authenticate, require('./user.route'));

module.exports = router;