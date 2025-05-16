const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    jwt_secret_token: process.env.SECRET_ACCESS_TOKEN || "test",
    mongodb_uri:process.env.MONGODB_URI,
    USER_MAIL: process.env.USER_MAIL,
    PASS_MAIL: process.env.PASS_MAIL,
    stripe_client_id: process.env.STRIPE_CLIENT_ID,
    stripe_redirect_uri: process.env.STRIPE_REDIRECT_URI,
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    stripe_webhook_endpoint: process.env.STRIPE_WEBHOOK_ENDPOINT,
    client_url: process.env.CLIENT_URL || "http://localhost:8081",
    ghl_webhook_url: process.env.GHL_WEBHOOK_URL,
};
