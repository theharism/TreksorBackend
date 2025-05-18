const express = require('express');
const keys = require('./config/keys');
const logger = require('./services/logger');
const routes = require('./routes');
const loggingMiddleware = require('./middlewares/loggingMiddleware');
const cors = require('cors');
const db = require("./config/db");
const path = require('path');

const app = express();

db();

app.use(cors({
  origin: 'http://localhost:8081', // Replace with your frontend URL (Expo or any other)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(loggingMiddleware);

app.use('/api/v1', routes);

const uploads = path.join(__dirname, './uploads');
app.use('/uploads', express.static(uploads));

app.listen(keys.port, () => {
  logger.info(logger.logTypes.SERVER,{message:`Server is running on port ${keys.port} - ${keys.env} Level`});
});