const logger = require("../services/logger");
const openai = require('../config/openai'); 

exports.createMessage = async (req, res) => {
    try {
        const { messages } = req.body;
     
        if (!messages || !Array.isArray(messages)) {
            logger.warn("Invalid messages format in request body");
            return res.status(400).json({ error: "messages must be an array" });
        }

        const systemPrompt = `
            You are Treksor Assistant, a helpful assistant for fitness enthusiasts using the Treksor app.
            Treksor provides guidance on gym workouts (push, pull, leg), nutrition plans, supplements, meditations, and power thoughts.
            Respond with accurate advice, actionable tips, and motivational insights tailored to the user's fitness journey.
            Never provide unsafe or unverified information.

            Use the context provided as ground truth. Be concise, supportive, and use encouraging language.
        `;

        logger.info("Sending request to OpenAI with provided Stripe context and messages");
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map(m => ({role:m.role, content: m.content})),
            ],
        });

        logger.info("Received response from OpenAI successfully", response.choices[0].message.content);
        return res.status(200).json({ success: true, data: {id: Date.now().toString(),role: 'assistant', content: response.choices[0].message.content, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } });
    } catch (error) {
        console.error(error)
        logger.error("Error processing OpenAI chat request:", error);
        return res.status(500).json({ success: false, error: "Failed to process chat request" });
    }
};