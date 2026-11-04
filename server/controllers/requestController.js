const { getDB } = require('../config/db');
const {
    toObjectId,
    cleanText,
    escapeRegex,
    getPagination,
    getToday,
    parseDate,
    withAvailability,
} = require('../utils/helpers');

const requestsCollection = () => getDB().collection('requests');
const booksCollection = () => getDB().collection('books');
const issuesCollection = () => getDB().collection('issues');

const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

// Student sends a request for a book
const createRequest = async (req, res) => {
    const bookId = toObjectId(req.body.bookId);
    const book = bookId ? await booksCollection().findOne({ _id: bookId }) : null;
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    if (book.availableCopies < 1) {
        return res.status(400).json({
            success: false,
            message: `"${book.title}" is currently unavailable. You can request it when a copy is returned.`,
        });
    }

    const student = req.user;
    const pending = await requestsCollection().findOne({ bookId, studentAccountId: student._id, status: 'pending' });
    if (pending) {
        return res.status(409).json({ success: false, message: 'You have already requested this book. Please wait for approval.' });
    }

    const activeIssue = await issuesCollection().findOne({
        bookId,
        status: 'issued',
        $or: [{ studentAccountId: student._id }, { roll: student.roll, department: student.department }],
    });
    if (activeIssue) {
        return res.status(409).json({ success: false, message: 'You already have this book. Return it before requesting it again.' });
    }

    const now = new Date();
    const request = {
        bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCategory: book.category,
        bookCover: book.coverImage || '',
        studentAccountId: student._id,
        studentName: student.name,
        roll: student.roll,
        department: student.department,
        semester: student.semester,
        shift: student.shift,
        phone: student.phone,
        status: 'pending',
        note: '',
        issueId: null,
        dueDate: null,
        createdAt: now,
        updatedAt: now,
    };

    const result = await requestsCollection().insertOne(request);
    res.status(201).json({
        success: true,
        message: `Request sent for "${book.title}". The librarian will review it soon.`,
        data: { _id: result.insertedId, ...request },
    });
};

// Student sees their own requests, with the issue status of approved ones
const getMyRequests = async (req, res) => {
    const requests = await requestsCollection()
        .find({ studentAccountId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    const issueIds = requests.filter((request) => request.issueId).map((request) => request.issueId);
    const issues = issueIds.length ? await issuesCollection().find({ _id: { $in: issueIds } }).toArray() : [];
    const today = getToday();

    const data = requests.map((request) => {
        const issue = request.issueId ? issues.find((item) => item._id.equals(request.issueId)) : null;
        return {
            ...request,
            issue: issue
                ? {
                      status: issue.status,
                      issueDate: issue.issueDate,
                      dueDate: issue.dueDate,
                      returnDate: issue.returnDate,
                      isOverdue: issue.status === 'issued' && new Date(issue.dueDate) < today,
                  }
                : null,
        };
    });

    res.json({ success: true, data });
};

const cancelRequest = async (req, res) => {
    const id = toObjectId(req.params.id);
    const result = id
        ? await requestsCollection().updateOne(
              { _id: id, studentAccountId: req.user._id, status: 'pending' },
              { $set: { status: 'cancelled', updatedAt: new Date() } }
          )
        : null;

    if (!result || result.modifiedCount === 0) {
        return res.status(400).json({ success: false, message: 'Only your pending requests can be cancelled.' });
    }
    res.json({ success: true, message: 'Request cancelled.' });
};

// Admin list of all requests
const getRequests = async (req, res) => {
    const { status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query, 10);
    const query = {};

    if (STATUSES.includes(status)) query.status = status;
    if (search && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        query.$or = [{ studentName: regex }, { roll: regex }, { phone: regex }, { bookTitle: regex }];
    }

    // Oldest pending requests first, so they are handled in order
    const sortBy = status === 'pending' ? { createdAt: 1 } : { createdAt: -1 };

    const [total, pendingCount, requests] = await Promise.all([
        requestsCollection().countDocuments(query),
        requestsCollection().countDocuments({ status: 'pending' }),
        requestsCollection().find(query).sort(sortBy).skip(skip).limit(limit).toArray(),
    ]);

    const bookIds = requests.map((request) => request.bookId);
    const books = await booksCollection()
        .find({ _id: { $in: bookIds } }, { projection: { availableCopies: 1, totalCopies: 1 } })
        .toArray();

    const data = requests.map((request) => {
        const book = books.find((item) => item._id.equals(request.bookId));
        return { ...request, book: book ? withAvailability(book) : null };
    });

    res.json({
        success: true,
        data: { requests: data, total, pendingCount, page, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
};

// Approving a request issues the book automatically
const approveRequest = async (req, res) => {
    const id = toObjectId(req.params.id);
    const request = id ? await requestsCollection().findOne({ _id: id }) : null;
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'pending') {
        return res.status(400).json({ success: false, message: `This request is already ${request.status}.` });
    }

    const today = getToday();
    const dueDate = parseDate(req.body.dueDate);
    if (!dueDate || dueDate < today) {
        return res.status(400).json({ success: false, message: 'Please choose a due date from today onwards.' });
    }

    const book = await booksCollection().findOne({ _id: request.bookId });
    if (!book) {
        return res.status(404).json({ success: false, message: 'This book no longer exists. Please reject the request.' });
    }

    // Use the latest profile details if the student account still exists
    const account = await getDB().collection('students').findOne({ _id: request.studentAccountId });
    const student = {
        studentName: account ? account.name : request.studentName,
        roll: account ? account.roll : request.roll,
        department: account ? account.department : request.department,
        semester: account ? account.semester : request.semester,
        shift: account ? account.shift : request.shift,
        phone: account ? account.phone : request.phone,
    };

    const duplicate = await issuesCollection().findOne({
        bookId: request.bookId,
        status: 'issued',
        $or: [{ studentAccountId: request.studentAccountId }, { roll: student.roll, department: student.department }],
    });
    if (duplicate) {
        return res.status(409).json({ success: false, message: `${student.studentName} already has this book issued.` });
    }

    const resetRequest = { status: 'pending', dueDate: null, processedBy: null, processedAt: null };

    // Mark the request first so it can never be approved twice
    const claimed = await requestsCollection().updateOne(
        { _id: id, status: 'pending' },
        { $set: { status: 'approved', dueDate, processedBy: req.user.email, processedAt: new Date(), updatedAt: new Date() } }
    );
    if (claimed.modifiedCount === 0) {
        return res.status(409).json({ success: false, message: 'This request was just handled. Please refresh.' });
    }

    const stockUpdate = await booksCollection().updateOne(
        { _id: request.bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1, issuedCopies: 1 }, $set: { updatedAt: new Date() } }
    );
    if (stockUpdate.modifiedCount === 0) {
        await requestsCollection().updateOne({ _id: id }, { $set: resetRequest });
        return res.status(400).json({
            success: false,
            message: `No copies of "${book.title}" are available right now. Wait for a return or reject the request.`,
        });
    }

    const issue = {
        bookId: request.bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        ...student,
        studentAccountId: request.studentAccountId,
        requestId: id,
        issueDate: today,
        dueDate,
        returnDate: null,
        status: 'issued',
        issuedBy: req.user.email,
        createdAt: new Date(),
    };

    try {
        const result = await issuesCollection().insertOne(issue);
        await requestsCollection().updateOne({ _id: id }, { $set: { issueId: result.insertedId } });
        res.json({
            success: true,
            message: `Request approved. "${book.title}" is issued to ${student.studentName}.`,
            data: { ...request, status: 'approved', dueDate, issueId: result.insertedId },
        });
    } catch (err) {
        // Undo the stock change and the approval if the issue could not be saved
        await booksCollection().updateOne({ _id: request.bookId }, { $inc: { availableCopies: 1, issuedCopies: -1 } });
        await requestsCollection().updateOne({ _id: id }, { $set: resetRequest });
        throw err;
    }
};

const rejectRequest = async (req, res) => {
    const id = toObjectId(req.params.id);
    const note = cleanText(req.body.note);
    if (note.length > 300) {
        return res.status(400).json({ success: false, message: 'Reason must be under 300 characters.' });
    }

    const result = id
        ? await requestsCollection().updateOne(
              { _id: id, status: 'pending' },
              { $set: { status: 'rejected', note, processedBy: req.user.email, processedAt: new Date(), updatedAt: new Date() } }
          )
        : null;

    if (!result || result.modifiedCount === 0) {
        return res.status(400).json({ success: false, message: 'Only pending requests can be rejected.' });
    }
    res.json({ success: true, message: 'Request rejected.' });
};

module.exports = { createRequest, getMyRequests, cancelRequest, getRequests, approveRequest, rejectRequest };
