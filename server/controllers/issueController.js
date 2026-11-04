const { getDB } = require('../config/db');
const { toObjectId, escapeRegex, getPagination, getToday, parseDate } = require('../utils/helpers');
const { validateStudentInfo } = require('../utils/validateStudent');

const issuesCollection = () => getDB().collection('issues');
const booksCollection = () => getDB().collection('books');

const withOverdue = (issue) => ({
    ...issue,
    isOverdue: issue.status === 'issued' && new Date(issue.dueDate) < getToday(),
});

// Manual issue from the admin panel
const createIssue = async (req, res) => {
    const bookId = toObjectId(req.body.bookId);
    const { error: studentError, info } = validateStudentInfo({ ...req.body, name: req.body.studentName });
    const issueDate = req.body.issueDate ? parseDate(req.body.issueDate) : getToday();
    const dueDate = parseDate(req.body.dueDate);

    let error = null;
    if (!bookId) error = 'Please select a book.';
    else if (studentError) error = studentError;
    else if (!issueDate) error = 'Please enter a valid issue date.';
    else if (!dueDate) error = 'Please enter a valid due date.';
    else if (dueDate < issueDate) error = 'Due date cannot be before the issue date.';
    if (error) return res.status(400).json({ success: false, message: error });

    const book = await booksCollection().findOne({ _id: bookId });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    const duplicate = await issuesCollection().findOne({
        bookId,
        roll: info.roll,
        department: info.department,
        status: 'issued',
    });
    if (duplicate) {
        return res.status(409).json({
            success: false,
            message: `Roll ${info.roll} (${info.department}) already has "${book.title}" and has not returned it yet.`,
        });
    }

    // Take one copy only if at least one is available (atomic, so stock never goes negative)
    const stockUpdate = await booksCollection().updateOne(
        { _id: bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1, issuedCopies: 1 }, $set: { updatedAt: new Date() } }
    );
    if (stockUpdate.modifiedCount === 0) {
        return res.status(400).json({ success: false, message: `"${book.title}" is currently unavailable. All copies are issued.` });
    }

    const issue = {
        bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        studentName: info.name,
        roll: info.roll,
        department: info.department,
        semester: info.semester,
        shift: info.shift,
        phone: info.phone,
        studentAccountId: null,
        requestId: null,
        issueDate,
        dueDate,
        returnDate: null,
        status: 'issued',
        issuedBy: req.user.email,
        createdAt: new Date(),
    };

    try {
        const result = await issuesCollection().insertOne(issue);
        res.status(201).json({
            success: true,
            message: `"${book.title}" issued to ${info.name}.`,
            data: withOverdue({ _id: result.insertedId, ...issue }),
        });
    } catch (err) {
        // Give the copy back if the record could not be saved
        await booksCollection().updateOne({ _id: bookId }, { $inc: { availableCopies: 1, issuedCopies: -1 } });
        throw err;
    }
};

const getIssues = async (req, res) => {
    const { status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query, 10);
    const query = {};

    if (status === 'issued') query.status = 'issued';
    if (status === 'returned') query.status = 'returned';
    if (status === 'overdue') {
        query.status = 'issued';
        query.dueDate = { $lt: getToday() };
    }
    if (search && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        query.$or = [{ studentName: regex }, { roll: regex }, { phone: regex }, { bookTitle: regex }, { bookAuthor: regex }];
    }

    const sortBy = status === 'returned' ? { returnDate: -1 } : { createdAt: -1 };

    const [total, issues] = await Promise.all([
        issuesCollection().countDocuments(query),
        issuesCollection().find(query).sort(sortBy).skip(skip).limit(limit).toArray(),
    ]);

    res.json({
        success: true,
        data: {
            issues: issues.map(withOverdue),
            total,
            page,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        },
    });
};

const getIssueById = async (req, res) => {
    const id = toObjectId(req.params.id);
    const issue = id ? await issuesCollection().findOne({ _id: id }) : null;
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found.' });
    res.json({ success: true, data: withOverdue(issue) });
};

const returnIssue = async (req, res) => {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(404).json({ success: false, message: 'Issue record not found.' });

    // Only an "issued" record can be returned, so the same book cannot be returned twice
    const issue = await issuesCollection().findOneAndUpdate(
        { _id: id, status: 'issued' },
        { $set: { status: 'returned', returnDate: new Date(), returnedBy: req.user.email } },
        { returnDocument: 'after' }
    );

    if (!issue) {
        const exists = await issuesCollection().findOne({ _id: id });
        if (!exists) return res.status(404).json({ success: false, message: 'Issue record not found.' });
        return res.status(400).json({ success: false, message: 'This book has already been returned.' });
    }

    await booksCollection().updateOne(
        { _id: issue.bookId, issuedCopies: { $gt: 0 } },
        { $inc: { availableCopies: 1, issuedCopies: -1 }, $set: { updatedAt: new Date() } }
    );

    res.json({
        success: true,
        message: `"${issue.bookTitle}" returned by ${issue.studentName}.`,
        data: withOverdue(issue),
    });
};

module.exports = { createIssue, getIssues, getIssueById, returnIssue };
