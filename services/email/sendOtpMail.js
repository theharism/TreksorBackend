const sendEmail = require("../mailer");
const logger = require("../logger");

module.exports = (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Starting registration otp email process for ${email}`);
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 24px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">🔐 Treksor Registration OTP</h2>
            <p style="font-size: 16px; color: #555;">
            Hello,
            </p>
            <p style="font-size: 16px; color: #555;">
            Use the following OTP to complete your registration on <strong>Treksor</strong>:
            </p>
            <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #1e88e5; background-color: #e3f2fd; padding: 12px 24px; border-radius: 6px;">
                ${otp}
            </span>
            </div>
            <p style="font-size: 14px; color: #888;">
            This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
            </p>
            <p style="font-size: 14px; color: #aaa; text-align: center; margin-top: 32px;">
            — Treksor Team
            </p>
        </div>
        `;

      logger.debug(`Email HTML content generated for ${email} as ${html}`);

      await sendEmail({
        to: email,
        subject: "Registration OTP - Treksor",
        html,
      });

      logger.info(`Registration otp email sent successfully to ${email}`);
      resolve();
    } catch (error) {
      logger.error(
        `Failed to send registration otp email to ${email}: ${error.message}`
      );
      reject(error);
    }
  });
};
