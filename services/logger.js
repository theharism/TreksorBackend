const winston = require('winston');
const fs = require('fs');
const keys = require('../config/keys');
require('winston-daily-rotate-file');

if (!fs.existsSync('../logs')) {
  fs.mkdirSync('../logs');
}

if (!fs.existsSync('../logs/info')) {
  fs.mkdirSync('../logs/info');
}

if (!fs.existsSync('../logs/error')) {
  fs.mkdirSync('../logs/error');
}

const infoLogs = new winston.transports.DailyRotateFile({
  name: 'Info',
  dirname: '../logs/info',
  prepend: true,
  filename: 'info.log',
  zippedArchive: true,
  level: 'info',
  maxFiles: '30d',
});

var errorLogs = new winston.transports.DailyRotateFile({
  name: 'Errors',
  prepend: true,
  dirname: '../logs/error',
  filename: 'error.log',
  zippedArchive: true,
  level: 'error',
  maxFiles: '30d',
});

var transports = [infoLogs, errorLogs];

if (keys.env === 'development' || keys.env === 'staging') {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    })
  );
}

const logger = new winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports,
  exitOnError: false,
});

logger.logTypes = require("../config/logTypes");

module.exports = logger;