const mongoose = require("mongoose");
const keys = require("./keys");
const logger = require("../services/logger");

module.exports =async () => {
  try {
    await mongoose.connect(
        keys.mongodb_uri
    );
    logger.info(logger.logTypes.DB,{message:"Connected to MongoDB"});
  } catch (error) {
    logger.error(logger.logTypes.DB,{message:error.message});
    process.exit(1);
  }
};