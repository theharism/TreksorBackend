const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const upload = require('../config/multer');

router.get('/me', userController.me);
router.patch('/profile',upload.single("avatar"), userController.updateProfile);

module.exports = router;