import {
    BookOpen,
    Bookmark,
    Feather,
    FlaskConical,
    Flag,
    Globe,
    Landmark,
    Languages,
    Sprout,
} from 'lucide-react';

export const CONTACT = {
    phone: '013260*****',
    email: 'contact@rmpilibrary.com',
    location: 'RMPI, Amchattor, Rajshahi, Bangladesh.',
};

const categoryStyles = {
    'বাংলা উপন্যাস': { color: '#7a2e1f', icon: BookOpen },
    'বাংলা সাহিত্য': { color: '#5b2a5e', icon: Feather },
    'বাংলাদেশের ইতিহাস': { color: '#1f4d3a', icon: Landmark },
    'মুক্তিযুদ্ধ ও স্বাধীনতা': { color: '#7f1d1d', icon: Flag },
    'ইংরেজি শেখা': { color: '#1e3a6e', icon: Languages },
    'বিজ্ঞান ও প্রযুক্তি': { color: '#134e4a', icon: FlaskConical },
    'সাধারণ জ্ঞান': { color: '#6b4423', icon: Globe },
    'আত্মউন্নয়ন': { color: '#3f3f56', icon: Sprout },
};

const extraColors = ['#1e3a6e', '#7a2e1f', '#1f4d3a', '#5b2a5e', '#134e4a', '#6b4423'];

// New categories added by the admin get a stable color based on their name
export const getCategoryStyle = (category = '') => {
    if (categoryStyles[category]) return categoryStyles[category];
    const sum = [...category].reduce((total, char) => total + char.charCodeAt(0), 0);
    return { color: extraColors[sum % extraColors.length], icon: Bookmark };
};

// Issue and due dates are saved as plain dates, so they are shown in UTC
export const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

export const formatLocalDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const toInputDate = (date = new Date()) => {
    const local = new Date(date);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().slice(0, 10);
};

export const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// Turns "+880 1712-345678" into "01712345678"
export const normalizePhone = (value = '') => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('880')) digits = digits.slice(2);
    return digits;
};

// Same rules as the server, so mistakes are shown before sending the form
export const validateStudentForm = (values) => {
    const errors = {};
    if (values.name.trim().length < 2) errors.name = 'Please enter the full name.';
    if (!/^[A-Za-z0-9-]{1,20}$/.test(values.roll.trim())) errors.roll = 'Enter a valid roll (letters and numbers only).';
    if (!values.department) errors.department = 'Please choose a department.';
    if (!values.semester) errors.semester = 'Please choose a semester.';
    if (!values.shift) errors.shift = 'Please choose a shift.';
    if (!/^01[3-9]\d{8}$/.test(normalizePhone(values.phone))) {
        errors.phone = 'Enter a valid 11-digit mobile number, e.g. 01712345678.';
    }
    return errors;
};

// e.g. "Computer · 5th semester · 1st shift"
export const formatStudentClass = (student) =>
    [student.department, student.semester && `${student.semester} semester`, student.shift && `${student.shift} shift`]
        .filter(Boolean)
        .join(' · ');

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);
