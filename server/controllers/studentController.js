const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { cleanText, isValidEmail, escapeRegex, getPagination } = require('../utils/helpers');
const { validateStudentInfo } = require('../utils/validateStudent');
const { DEPARTMENTS, SEMESTERS, SHIFTS } = require('../utils/constants');

const studentsCollection = () => getDB().collection('students');

const createToken = (student) =>
    jwt.sign({ id: student._id.toString(), role: 'student' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

const publicStudent = (student) => ({
    _id: student._id,
    name: student.name,
    email: student.email,
    roll: student.roll,
    department: student.department,
    semester: student.semester,
    shift: student.shift,
    phone: student.phone,
    role: 'student',
    createdAt: student.createdAt,
});

const getOptions = (req, res) => {
    res.json({ success: true, data: { departments: DEPARTMENTS, semesters: SEMESTERS, shifts: SHIFTS } });
};

const register = async (req, res) => {
    const { error, info } = validateStudentInfo(req.body);
    const email = cleanText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    let message = error;
    if (!message && (!isValidEmail(email) || email.length > 100)) message = 'Please enter a valid email address.';
    if (!message && (password.length < 6 || password.length > 72)) message = 'Password must be 6 to 72 characters.';
    if (message) return res.status(400).json({ success: false, message });

    if (await studentsCollection().findOne({ email })) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }
    if (await studentsCollection().findOne({ roll: info.roll, department: info.department })) {
        return res.status(409).json({ success: false, message: `Roll ${info.roll} is already registered in ${info.department}.` });
    }

    const now = new Date();
    const student = {
        ...info,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        createdAt: now,
        updatedAt: now,
    };
    const result = await studentsCollection().insertOne(student);
    student._id = result.insertedId;

    res.status(201).json({
        success: true,
        message: `Welcome to RMPI Library, ${student.name}!`,
        data: { token: createToken(student), user: publicStudent(student) },
    });
};

const login = async (req, res) => {
    const email = cleanText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const student = await studentsCollection().findOne({ email });
    const isMatch = student ? await bcrypt.compare(password, student.passwordHash) : false;

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({
        success: true,
        message: `Welcome back, ${student.name}!`,
        data: { token: createToken(student), user: publicStudent(student) },
    });
};

const updateProfile = async (req, res) => {
    const { error, info } = validateStudentInfo(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const duplicate = await studentsCollection().findOne({
        roll: info.roll,
        department: info.department,
        _id: { $ne: req.user._id },
    });
    if (duplicate) {
        return res.status(409).json({ success: false, message: `Roll ${info.roll} is already registered in ${info.department}.` });
    }

    await studentsCollection().updateOne({ _id: req.user._id }, { $set: { ...info, updatedAt: new Date() } });
    res.json({ success: true, message: 'Profile updated.', data: publicStudent({ ...req.user, ...info }) });
};

// Admin list of all registered students
const getStudents = async (req, res) => {
    const { search, department } = req.query;
    const { page, limit, skip } = getPagination(req.query, 12);
    const query = {};

    if (department) query.department = department;
    if (search && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        query.$or = [{ name: regex }, { roll: regex }, { phone: regex }, { email: regex }];
    }

    const [total, students] = await Promise.all([
        studentsCollection().countDocuments(query),
        studentsCollection()
            .find(query, { projection: { passwordHash: 0 } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
    ]);

    res.json({
        success: true,
        data: { students, total, page, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
};

module.exports = { getOptions, register, login, updateProfile, getStudents };
