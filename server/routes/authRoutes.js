const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, login);
router.get('/me', verifyToken, getMe);

module.exports = router;
