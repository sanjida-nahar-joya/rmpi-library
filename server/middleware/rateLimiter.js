const { rateLimit } = require('express-rate-limit');

// Only failed login attempts are counted
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Too many failed login attempts. Please try again after 15 minutes.' },
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Too many accounts created from this device. Please try again later.' },
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'You have sent too many messages. Please try again later.' },
});

module.exports = { loginLimiter, registerLimiter, contactLimiter };
