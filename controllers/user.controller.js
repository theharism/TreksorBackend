const logger = require("../services/logger"); // Assuming you have a logger service
const User = require("../models/user.model"); // Assuming you have a User model
// login
exports.me = async (req, res) => {
  try {
    logger.info(`Fetching user with email ${req.user.email}`);

    const user = req.user;

    if (!user.isVerified) {
      return res.status(200).json({
        success: false,
        data: {
          user: {
            id: "",
            name: "",
            email: "",
            role: "",
            avatar: "",
            isVerified: false,
            authProvider: user.authProvider,
          },
        },
        message:
          "Your email is not verified. Please verify your email to access this resource.",
      });
    }

    const daysLeft = user?.createdAt
      ? Math.max(
          0,
          7 - Math.floor((Date.now() - new Date(user.createdAt)) / 86400000)
        )
      : null;

    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        plan: user.plan,
        daysLeft: daysLeft,
      },
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error(`Error fetching user with email ${req.user.email}: `, error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    logger.info(`Updating profile for user with email ${req.user.email}`);

    const { name } = req.body;
    const avatar = req.file ? req.file.destination + req.file.filename : null;

    if (!name && !avatar) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    const user = await User.findById(req.user._id);

    if (name) {
      user.name = name;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    logger.error(
      `Error updating profile for user with email ${req.user.email}: `,
      error
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.savePushToken = async (req, res) => {
  try {
    logger.info(`Saving push token for user with email ${req.user.email}`);

    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token is required.",
      });
    }

    const user = await User.findById(req.user._id);
    user.pushToken = pushToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Push token saved successfully.",
    });
  } catch (error) {
    logger.error(
      `Error saving push token for user with email ${req.user.email}: `,
      error
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    logger.info(`Deleting user with email ${req.user.email}`);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    logger.error(`Error deleting user with email ${req.user.email}: `, error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
