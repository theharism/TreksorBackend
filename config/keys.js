const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    jwt_secret_token: process.env.SECRET_ACCESS_TOKEN || "test",
    mongodb_uri:process.env.MONGODB_URI,
    USER_MAIL: process.env.USER_MAIL,
    PASS_MAIL: process.env.PASS_MAIL,
    client_url: process.env.CLIENT_URL || "http://localhost:8081",
};
