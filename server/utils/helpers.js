const { ObjectId } = require('mongodb');

// A book with this many available copies (or fewer) is shown as "Limited Copies"
const LOW_STOCK_LIMIT = 2;

const toObjectId = (id) => {
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) return null;
    return new ObjectId(id);
};

const getAvailability = (book) => {
    if (book.availableCopies <= 0) return 'unavailable';
    if (book.availableCopies <= LOW_STOCK_LIMIT) return 'limited';
    return 'available';
};

const withAvailability = (book) => ({ ...book, availability: getAvailability(book) });

const availabilityQuery = (availability) => {
    if (availability === 'available') return { availableCopies: { $gt: LOW_STOCK_LIMIT } };
    if (availability === 'limited') return { availableCopies: { $gt: 0, $lte: LOW_STOCK_LIMIT } };
    if (availability === 'unavailable') return { availableCopies: { $lte: 0 } };
    return {};
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const getPagination = (query, defaultLimit = 12) => {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || defaultLimit, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};

// Today's date at 00:00, used to decide if an issue is overdue
const getToday = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

// Reads a "YYYY-MM-DD" date from a form
const parseDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(value);
    return isNaN(date) ? null : date;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

module.exports = {
    LOW_STOCK_LIMIT,
    toObjectId,
    getAvailability,
    withAvailability,
    availabilityQuery,
    escapeRegex,
    cleanText,
    getPagination,
    getToday,
    parseDate,
    isValidEmail,
};
