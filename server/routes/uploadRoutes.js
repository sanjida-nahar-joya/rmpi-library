const express = require('express');
const { uploadImage } = require('../controllers/uploadController');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', verifyToken, verifyAdmin, upload.single('image'), uploadImage);

module.exports = router;
