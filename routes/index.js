const express = require('express');
const { authenticate, authorize } = require('../middlewares/authenticationMiddleware');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/user', authenticate, require('./user.route'));
router.use('/article', authenticate, require('./article.route'));
router.use('/power-thought', authenticate, require('./powerThought.route'));
router.use('/chat', authenticate, require('./chat.route'));

module.exports = router;