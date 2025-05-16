const logger = require('./logger');
const keys = require('../config/keys');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: keys.USER_MAIL,
      pass: keys.PASS_MAIL,
    },
});

module.exports = async function ({ to, subject, html }) {

    const mailOptions = {
        to: to,
        subject: subject,
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(logger.logTypes.EMAIL,{ success: true, message: "Email sent successfully", to, subject });
    } catch (error) {
        console.error("Error sending email:", error);
        logger.error(logger.logTypes.EMAIL, { success: false, error: error.message, to, subject });
        throw new Error(error.message);
    }
};
