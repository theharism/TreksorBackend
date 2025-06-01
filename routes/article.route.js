const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const upload = require('../config/multer');

router.post('/', upload.single("image"), articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.patch('/:id', upload.single("image"), articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router;