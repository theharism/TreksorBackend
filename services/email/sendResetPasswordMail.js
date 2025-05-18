const sendEmail = require('../mailer');
const logger = require('../logger'); // Assuming you have a logger module
const keys = require('../../config/keys');

module.exports = (email, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info(`Starting password reset email process for ${email}`);

            const html = `
                <div style="font-family: sans-serif; line-height: 1.5;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. The verification otp is below to set a new password:</p>
                    <p>${otp}</p>
                    <p>If you didn’t request this, you can safely ignore this email.</p>
                    <p>This link will expire in 15 minutes.</p>
                </div>
            `;

            logger.debug(`Email HTML content generated for ${email}`);

            await sendEmail({
                to: email,
                subject: 'Reset Your Password',
                html,
            });

            logger.info(`Password reset email sent successfully to ${email}`);
            resolve();
        } catch (error) {
            logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
            reject(error);
        }
    });
};
