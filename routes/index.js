const express = require('express');
const { authenticate, authorize } = require('../middlewares/authenticationMiddleware');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/user', authenticate, require('./user.route'));
router.use('/article', authenticate, authorize, require('./article.route'));

module.exports = router;