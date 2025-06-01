const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const upload = require('../config/multer');
const { authorize } = require('../middlewares/authenticationMiddleware');

router.post('/', authorize, upload.single("image"), articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.patch('/:id', authorize, upload.single("image"), articleController.updateArticle);
router.delete('/:id', authorize, articleController.deleteArticle);

module.exports = router;