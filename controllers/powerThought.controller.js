const PowerThought = require("../models/powerThought.model");
const { Expo } = require('expo-server-sdk');
const logger = require("../services/logger");
const User = require('../models/user.model'); // Assuming you have a User model

const expo = new Expo({
  useFcmV1: true,
});

// Create a power thought
exports.createPowerThought = async (req, res) => {
  try {
    const thought = await PowerThought.create(req.body);
    logger.info(`PowerThought created on ${thought.date}`);
    // Create the messages that you want to send to clients
    let messages = [];
    const somePushTokens = await User.find().select("pushToken");
    for (let pushToken of somePushTokens) {
      // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken.pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
      messages.push({
        to: pushToken,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
        // richContent: {
        //   image: 'https://example.com/statics/some-image-here-if-you-want.jpg'
        // },
      })
    }

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      // Send the chunks to the Expo push notification service. There are
      // different strategies you could use. A simple one is to send one chunk at a
      // time, which nicely spreads the load out over time:
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation:
          // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        } catch (error) {
          console.error(error);
        }
      }
    })();
    res.status(201).json({ success: true, data: thought });
  } catch (error) {
    logger.error("Error creating PowerThought:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all power thoughts with pagination
exports.getAllPowerThoughts = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const [thoughts, total] = await Promise.all([
      PowerThought.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      PowerThought.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: thoughts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error("Error fetching PowerThoughts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single power thought by ID
exports.getPowerThoughtById = async (req, res) => {
  try {
    const thought = await PowerThought.findById(req.params.id);
    if (!thought) {
      return res.status(404).json({ success: false, message: "PowerThought not found" });
    }
    res.status(200).json({ success: true, thought });
  } catch (error) {
    logger.error(`Error fetching PowerThought ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update power thought
exports.updatePowerThought = async (req, res) => {
  try {
    const thought = await PowerThought.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!thought) {
      return res.status(404).json({ success: false, message: "PowerThought not found" });
    }

    logger.info(`Updated PowerThought ${req.params.id}`);
    res.status(200).json({ success: true, thought });
  } catch (error) {
    logger.error(`Error updating PowerThought ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete power thought
exports.deletePowerThought = async (req, res) => {
  try {
    const thought = await PowerThought.findByIdAndDelete(req.params.id);
    if (!thought) {
      return res.status(404).json({ success: false, message: "PowerThought not found" });
    }

    logger.info(`Deleted PowerThought ${req.params.id}`);
    res.status(200).json({ success: true, message: "PowerThought deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting PowerThought ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
