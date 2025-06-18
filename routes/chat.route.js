const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/', chatController.createMessage);
// router.get('/', chatController.getAllMessages);
// router.get('/:id', chatController.getMessageById);
// router.patch('/:id', chatController.updateMessage);
// router.delete('/:id', chatController.deleteMessage);

module.exports = router;