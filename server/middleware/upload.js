const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            const error = new Error('Only JPG, PNG or WEBP images are allowed.');
            error.status = 400;
            cb(error);
        }
    },
});

module.exports = upload;
