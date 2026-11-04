const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { cleanText } = require('../utils/helpers');

const adminsCollection = () => getDB().collection('admins');

const login = async (req, res) => {
    const email = cleanText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await adminsCollection().findOne({ email });
    const isMatch = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
        { id: admin._id.toString(), email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    await adminsCollection().updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

    res.json({
        success: true,
        message: `Welcome back, ${admin.name}!`,
        data: {
            token,
            user: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        },
    });
};

// Returns the logged in admin or student
const getMe = async (req, res) => {
    res.json({ success: true, data: req.user });
};

module.exports = { login, getMe };
