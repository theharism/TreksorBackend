const { Expo } = require('expo-server-sdk');
const Article = require('../models/article.model');
const PowerThought = require('../models/powerThought.model');
const User = require('../models/user.model');
const logger = require('./logger');

const expo = new Expo({
  useFcmV1: true,
});

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Send push notifications to users
 */
const sendNotifications = async (messages) => {
  if (messages.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  let failedCount = 0;

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      logger.info(`Sent ${chunk.length} push notifications`);
    } catch (error) {
      logger.error("Error sending push notifications:", error);
      failedCount += chunk.length;
    }
  }

  const successCount = tickets.filter(ticket => ticket.status === 'ok').length;
  return { sent: successCount, failed: failedCount + tickets.filter(t => t.status !== 'ok').length };
};

/**
 * Get all users with valid push tokens
 */
const getUsersWithPushTokens = async () => {
  const users = await User.find({ 
    pushToken: { $ne: null, $exists: true } 
  }).select("pushToken");

  return users.filter(user => user.pushToken && Expo.isExpoPushToken(user.pushToken));
};

/**
 * Send notifications for power thoughts scheduled for today
 */
const sendPowerThoughtNotifications = async () => {
  const today = getTodayDate();
  
  // Find power thoughts for today that haven't been notified yet
  const powerThoughts = await PowerThought.find({
    date: today,
    notificationSent: { $ne: true }
  });

  if (powerThoughts.length === 0) {
    logger.info(`No power thoughts to notify for ${today}`);
    return;
  }

  const users = await getUsersWithPushTokens();
  
  if (users.length === 0) {
    logger.info("No users with valid push tokens found");
    return;
  }

  for (const thought of powerThoughts) {
    let messages = [];
    
    // Truncate thought if too long for notification body
    const notificationBody = thought.thought.length > 100 
      ? thought.thought.substring(0, 97) + '...' 
      : thought.thought;

    for (let user of users) {
      messages.push({
        to: user.pushToken,
        sound: 'default',
        title: 'New Power Thought 💪',
        body: notificationBody,
        data: { 
          type: 'powerThought',
          powerThoughtId: thought._id.toString(),
          date: thought.date,
          thought: thought.thought
        },
      });
    }

    const result = await sendNotifications(messages);
    
    // Mark as notified
    await PowerThought.findByIdAndUpdate(thought._id, { notificationSent: true });
    logger.info(`Power thought notification sent for ${today}: ${result.sent} successful, ${result.failed} failed`);
  }
};

/**
 * Send notifications for articles scheduled for today
 */
const sendArticleNotifications = async () => {
  const today = getTodayDate();
  
  // Find articles for today that haven't been notified yet
  const articles = await Article.find({
    date: today,
    notificationSent: { $ne: true }
  });

  if (articles.length === 0) {
    logger.info(`No articles to notify for ${today}`);
    return;
  }

  const users = await getUsersWithPushTokens();
  
  if (users.length === 0) {
    logger.info("No users with valid push tokens found");
    return;
  }

  for (const article of articles) {
    let messages = [];
    
    // Truncate description if too long for notification body
    const notificationBody = article.description && article.description.length > 100 
      ? article.description.substring(0, 97) + '...' 
      : article.description || article.title;

    for (let user of users) {
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

    const result = await sendNotifications(messages);
    
    // Mark as notified
    await Article.findByIdAndUpdate(article._id, { notificationSent: true });
    logger.info(`Article notification sent for "${article.title}" on ${today}: ${result.sent} successful, ${result.failed} failed`);
  }
};

/**
 * Run all scheduled notifications
 */
const runScheduledNotifications = async () => {
  const today = getTodayDate();
  logger.info(`Running scheduled notifications for ${today}`);
  
  try {
    await sendPowerThoughtNotifications();
    await sendArticleNotifications();
    logger.info(`Completed scheduled notifications for ${today}`);
  } catch (error) {
    logger.error("Error running scheduled notifications:", error);
  }
};

/**
 * Start the notification scheduler
 * Runs every hour to check for scheduled notifications
 */
const startScheduler = () => {
  // Run immediately on startup
  runScheduledNotifications();
  
  // Then run every hour (3600000 ms)
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  
  setInterval(() => {
    runScheduledNotifications();
  }, INTERVAL_MS);
  
  logger.info("Notification scheduler started. Checking every hour for scheduled notifications.");
};

module.exports = {
  startScheduler,
  runScheduledNotifications,
  sendPowerThoughtNotifications,
  sendArticleNotifications,
};

