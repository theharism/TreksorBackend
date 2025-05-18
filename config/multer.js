const multer = require("multer");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Use a unique name to avoid conflicts
    },
});

// Multer middleware
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only jpeg, png, and webp files are allowed'), false);
        }
        cb(null, true);
    },
});

module.exports = upload;