const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 requests per 15 minutes
  message: { success: false, message: "Too many OTP requests. Please try later." },
});

module.exports = {otpLimiter};