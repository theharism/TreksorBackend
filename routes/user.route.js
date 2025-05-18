const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/me', userController.me);
router.patch('/profile',upload.single("avatar"), userController.updateProfile);

module.exports = router;