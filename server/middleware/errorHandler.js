const notFound = (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'value';
        const messages = {
            isbn: 'A book with this ISBN already exists.',
            email: 'An account with this email already exists.',
            roll: 'This roll is already registered in this department.',
        };
        return res.status(409).json({ success: false, message: messages[field] || `This ${field} already exists.` });
    }

    if (err.name === 'MulterError') {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 2 MB.' : err.message;
        return res.status(400).json({ success: false, message });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
    }

    if (err.status && err.status < 500) {
        return res.status(err.status).json({ success: false, message: err.message });
    }

    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again.' });
};

module.exports = { notFound, errorHandler };
