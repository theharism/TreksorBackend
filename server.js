const express = require('express');
const keys = require('./config/keys');
const logger = require('./services/logger');
const routes = require('./routes');
const loggingMiddleware = require('./middlewares/loggingMiddleware');
const cors = require('cors');
const db = require("./config/db");

const app = express();

db();

app.use(cors({
  origin: 'http://localhost:8081', // Replace with your frontend URL (Expo or any other)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

app.use('/webhook/v1', routes);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(loggingMiddleware);

app.use('/api/v1', routes);

app.listen(keys.port, () => {
  logger.info(logger.logTypes.SERVER,{message:`Server is running on port ${keys.port} - ${keys.env} Level`});
});