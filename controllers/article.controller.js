const Article = require("../models/article.model");
const { Expo } = require('expo-server-sdk');
const logger = require("../services/logger");
const User = require('../models/user.model');

const expo = new Expo({
  useFcmV1: true,
});

// Create an article
exports.createArticle = async (req, res) => {
  try {
    const image = req.file ? req.file.destination + req.file.filename : null;
    const article = await Article.create({...req.body,image});
    logger.info(`Article created with title "${req.body.title}"`);
    
    // Get all users with valid push tokens
    const users = await User.find({ 
      pushToken: { $ne: null, $exists: true } 
    }).select("pushToken");
    
    if (users.length === 0) {
      logger.info("No users with push tokens found");
      return res.status(201).json({ success: true, article });
    }

    // Create the messages that you want to send to clients
    let messages = [];
    for (let user of users) {
      if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
        logger.warn(`Push token ${user.pushToken} is not a valid Expo push token`);
        continue;
      }

      // Truncate description if too long for notification body (max ~100 chars recommended)
      const notificationBody = article.description && article.description.length > 100 
        ? article.description.substring(0, 97) + '...' 
        : article.description || article.title;

      messages.push({
        to: user.pushToken,
        sound: 'default',
        title: `New Article: ${article.title}`,
        body: notificationBody,
        data: { 
          type: 'article',
          articleId: article._id.toString(),
          category: article.category,
          date: article.date,
          title: article.title
        },
      });
    }

    if (messages.length === 0) {
      logger.info("No valid push tokens to send notifications to");
      return res.status(201).json({ success: true, article });
    }

    // Send notifications in chunks
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    
    (async () => {
      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          logger.info(`Sent ${chunk.length} push notifications`);
        } catch (error) {
          logger.error("Error sending push notifications:", error);
        }
      }
      
      // Log receipt IDs for tracking (optional)
      const receiptIds = tickets
        .filter(ticket => ticket.status === 'ok' && ticket.id)
        .map(ticket => ticket.id);
      
      if (receiptIds.length > 0) {
        logger.info(`Successfully sent ${receiptIds.length} notifications`);
      }
    })();

    res.status(201).json({ 
      success: true, 
      article,
      message: `Article created and notifications sent to ${messages.length} users`
    });
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
        if (!isAdmin) {
            query.date = { $lte: date };
        }
        const [articles, total] = await Promise.all([
            Article.find(query).sort({ createdAt: -1 }),
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
