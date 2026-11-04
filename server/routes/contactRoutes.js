const express = require('express');
const { createMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', contactLimiter, createMessage);
router.get('/', verifyToken, verifyAdmin, getMessages);
router.patch('/:id/read', verifyToken, verifyAdmin, markAsRead);
router.delete('/:id', verifyToken, verifyAdmin, deleteMessage);

module.exports = router;
