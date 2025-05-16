const User = require('../models/user.model');
const Otp = require('../models/otp.model');
const sendResetPasswordMail = require('../services/email/sendResetPasswordMail');
const sendOtpMail = require('../services/email/sendOtpMail');
const logger = require('../services/logger'); // Assuming you have a logger service
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateOtp } = require('../utils/otp');

// login
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            logger.warn(`User with email ${req.body.email} not found`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        logger.info(`Fetched user with email ${req.body.email} successfully`);

        const isPasswordValid = await bcrypt.compare(
            `${req.body.password}`,
            user.password
        );

        if (!isPasswordValid)
            return res.status(401).json({
                status: "failed",
                message:
                    "Invalid email or password. Please try again with the correct credentials.",
            });
        const token = user.generateAccessJWT(); // generate session token for user
        res.status(200).json({
            status: "success",
            message: "You have successfully logged in.",
            data: { token },
        });
    } catch (error) {
        logger.error(`Error fetching user with email ${req.body.email}: `, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        logger.info(`Created user with email ${req.body.email} successfully`);
        await user.save(); // Save the updated user object
        const token = user.generateAccessJWT(); // generate session token for user
        res.status(201).json({
            success: true,
            message: 'User created successfully',
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'email already exists' });
        }
        logger.error(`Error creating user with email ${req.body.email}: `, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.requestOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            logger.warn(`Email is required: ${email}`);
            return res.status(200).json({ success: true }); // Always respond with 200
        }

        const existingOtp = await Otp.findOne({ email });

        if (existingOtp && Date.now() < existingOtp.expiresAt) {
            logger.warn(`OTP re-requested too soon for ${email}`);
            return res.status(200).json({
                success: true,
                message: 'OTP already sent recently. Please wait before requesting again.',
            });
        }

        const otp = generateOtp();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        const attemptsLeft = 3;

        await sendOtpMail(email, otp)

        if (existingOtp) await Otp.deleteOne({ email });

        await Otp.create({
            email,
            otp,
            expiresAt,
            attemptsLeft,
        });

        logger.info(`Registration Otp created for ${email}`);
        res.status(200).json({ success: true, message: 'Registration Otp sent to email' });
    } catch (error) {
        logger.error('Error creating registration otp:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        logger.info(`OTP verification requested for email: ${email}`);

        const record = await Otp.findOne({ email });
        if (!record) {
            logger.warn(`OTP not found for email: ${email}`);
            return res.status(400).json({ success: false, message: "OTP not found." });
        }

        if (record.expiresAt < Date.now()) {
            logger.warn(`OTP expired for email: ${email}`);
            return res.status(400).json({ success: false, message: "OTP expired." });
        }

        if (record.attemptsLeft <= 0) {
            logger.warn(`Too many OTP attempts for email: ${email}`);
            return res.status(400).json({ success: false, message: "Too many attempts." });
        }

        const match = await bcrypt.compare(otp, record.otp);
        if (!match) {
            record.attemptsLeft -= 1;
            await record.save();
            logger.warn(`Invalid OTP entered for email: ${email}. Attempts left: ${record.attemptsLeft}`);
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        await Otp.deleteOne({ email });
        logger.info(`OTP successfully verified for email: ${email}`);

        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            logger.warn(`User not found for email: ${email} during OTP verification`);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        logger.info(`User with email ${email} successfully verified`);

        const token = user.generateAccessJWT(); // generate session token for user

        res.status(200).json({ success: true, message: 'Registration Otp Verified', data: { token } });
    } catch (error) {
        logger.error(`Error verifying OTP for email ${req.body.email}:`, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({ success: true }); // Always respond with 200
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
        await user.save();

        await sendResetPasswordMail(user.email, resetToken)

        logger.info(`Password reset token created for ${email}`);
        res.status(200).json({ success: true, message: 'Password reset link sent to email' });
    } catch (error) {
        logger.error('Error creating password reset token:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            logger.warn('Invalid or expired reset token used');
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        logger.info(`Password successfully reset for ${user.email}`);
        res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
        logger.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers['cookie']; // get the session cookie from request header
        if (!authHeader) return res.sendStatus(204); // No content
        // Also clear request cookie on client
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
    res.end();
};
