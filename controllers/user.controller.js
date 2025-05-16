const logger = require('../services/logger'); // Assuming you have a logger service

// login
exports.me = async (req, res) => {
    try {
        logger.info(`Fetching user with email ${req.user.email}`);

        const user = req.user;

        const response = {
            user : {
                id: user._id,
                name: user.name,
                email:user.email,
                role:user.role,
            },
        }
        
        res.status(200).json({
            status: "success",
            data: response,
        });
    } catch (error) {
        logger.error(`Error fetching user with email ${req.user.email}: `, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};