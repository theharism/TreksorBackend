const sendEmail = require('../mailer');
const logger = require('../logger'); // Assuming you have a logger module

module.exports = (email, resetToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info(`Starting password reset email process for ${email}`);
            const resetUrl = `${keys.client_url}/reset-password?token=${resetToken}`;
            logger.debug(`Generated reset URL: ${resetUrl}`);

            const html = `
                <div style="font-family: sans-serif; line-height: 1.5;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the link below to set a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                        Reset Password
                    </a>
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
