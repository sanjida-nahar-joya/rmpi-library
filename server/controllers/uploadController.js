const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadImage = async (req, res) => {
    if (!isCloudinaryConfigured()) {
        return res.status(503).json({
            success: false,
            message: 'Image upload is not set up yet. Add your Cloudinary keys to server/.env, or paste an image URL instead.',
        });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please choose an image to upload.' });
    }

    const fileData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    try {
        const result = await cloudinary.uploader.upload(fileData, { folder: 'rmpi-library/covers' });
        res.status(201).json({ success: true, message: 'Image uploaded.', data: { url: result.secure_url } });
    } catch (err) {
        console.error('Cloudinary upload failed:', err.message);
        // 401 means the Cloudinary keys in .env are wrong
        const message =
            err.http_code === 401
                ? 'Cloudinary rejected the API key or secret. Check the Cloudinary values in server/.env and restart the server.'
                : 'Image upload failed. Please try again, or paste an image URL instead.';
        res.status(502).json({ success: false, message });
    }
};

module.exports = { uploadImage };
