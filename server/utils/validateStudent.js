const { DEPARTMENTS, SEMESTERS, SHIFTS } = require('./constants');
const { cleanText } = require('./helpers');

// Turns "+880 1712-345678" into "01712345678"
const normalizePhone = (value) => {
    let digits = cleanText(value).replace(/\D/g, '');
    if (digits.startsWith('880')) digits = digits.slice(2);
    return digits;
};

// Checks the student details used in registration, profile and issue forms
const validateStudentInfo = (body) => {
    const info = {
        name: cleanText(body.name),
        roll: cleanText(body.roll).toUpperCase(),
        department: cleanText(body.department),
        semester: cleanText(body.semester),
        shift: cleanText(body.shift),
        phone: normalizePhone(body.phone),
    };

    let error = null;
    if (info.name.length < 2 || info.name.length > 100) error = 'Name must be 2 to 100 characters.';
    else if (!/^[A-Z0-9-]{1,20}$/.test(info.roll)) error = 'Roll must be up to 20 letters or numbers.';
    else if (!DEPARTMENTS.includes(info.department)) error = 'Please choose a valid department.';
    else if (!SEMESTERS.includes(info.semester)) error = 'Please choose a valid semester.';
    else if (!SHIFTS.includes(info.shift)) error = 'Please choose a valid shift.';
    else if (!/^01[3-9]\d{8}$/.test(info.phone)) error = 'Please enter a valid 11-digit mobile number (e.g. 01712345678).';

    return { error, info };
};

module.exports = { validateStudentInfo, normalizePhone };
