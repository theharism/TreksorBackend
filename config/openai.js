const keys = require("./keys");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: keys.openai_api_key });
module.exports = openai;