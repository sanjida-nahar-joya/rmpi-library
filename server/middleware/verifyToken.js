const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { toObjectId } = require('../utils/helpers');

// Works for both admins and students, the token says which one
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
    }

    const isStudent = decoded.role === 'student';
    const user = await getDB()
        .collection(isStudent ? 'students' : 'admins')
        .findOne({ _id: toObjectId(decoded.id) }, { projection: { passwordHash: 0 } });

    if (!user) {
        return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
    }

    req.user = isStudent ? { ...user, role: 'student' } : user;
    next();
};

const verifyAdmin = (req, res, next) => {
    if (!['admin', 'librarian'].includes(req.user?.role)) {
        return res.status(403).json({ success: false, message: 'Only library staff can do this.' });
    }
    next();
};

const verifyStudent = (req, res, next) => {
    if (req.user?.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Please log in with a student account to do this.' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyStudent };
