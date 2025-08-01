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
    for (let obj of somePushTokens) {
      if (!Expo.isExpoPushToken(obj.pushToken)) {
        console.error(`Push token ${obj.pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: obj.pushToken,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
      })
    }
    let chunks = expo.chunkPushNotifications(messages);
    (async () => {
      for (let chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
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
    let { page = 1, limit = 10, date } = req.query;
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : {date: { $lte: date }};
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const [thoughts, total] = await Promise.all([
      PowerThought.find(query).sort({ createdAt: -1 }),
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
