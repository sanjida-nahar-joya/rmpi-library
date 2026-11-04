const express = require('express');
const { getOptions, register, login, updateProfile, getStudents } = require('../controllers/studentController');
const { verifyToken, verifyAdmin, verifyStudent } = require('../middleware/verifyToken');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/options', getOptions);
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.put('/me', verifyToken, verifyStudent, updateProfile);
router.get('/', verifyToken, verifyAdmin, getStudents);

module.exports = router;
