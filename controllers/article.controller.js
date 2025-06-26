const Article = require("../models/article.model");
const logger = require("../services/logger");

// Create an article
exports.createArticle = async (req, res) => {
  try {
    const image = req.file ? req.file.destination + req.file.filename : null;
    const article = await Article.create({...req.body,image});
    logger.info(`Article created with title "${req.body.title}"`);
    res.status(201).json({ success: true, article });
  } catch (error) {
    logger.error('Error creating article:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all articles with pagination
exports.getAllArticles = async (req, res) => {
    try {
        let { page = 1, limit = 10, category = 'all', date} = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const isAdmin = req.user.role === 'admin';

        const skip = (page - 1) * limit;

        let query = category === 'all' ? {} : { category };
        if (isAdmin) {
            query.date = date;
        }
        const [articles, total] = await Promise.all([
            Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Article.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: articles,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        logger.error('Error fetching articles:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get article by ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(200).json({ success: true, article });
  } catch (error) {
    logger.error(`Error fetching article ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const image = req.file ? req.file.destination + req.file.filename : req.body.image;
    const article = await Article.findByIdAndUpdate(req.params.id, {...req.body,image}, {
      new: true,
      runValidators: true
    });

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    logger.info(`Updated article ${req.params.id}`);
    res.status(200).json({ success: true, article });
  } catch (error) {
    logger.error(`Error updating article ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    logger.info(`Deleted article ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting article ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
