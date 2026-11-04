const { getDB } = require('../config/db');
const {
    toObjectId,
    withAvailability,
    availabilityQuery,
    escapeRegex,
    cleanText,
    getPagination,
} = require('../utils/helpers');

const booksCollection = () => getDB().collection('books');
const issuesCollection = () => getDB().collection('issues');

const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    title: { title: 1 },
    'title-desc': { title: -1 },
};

const validateBook = async (body) => {
    const errors = [];
    const book = {
        title: cleanText(body.title),
        author: cleanText(body.author),
        category: cleanText(body.category),
        isbn: cleanText(body.isbn).replace(/[-\s]/g, '').toUpperCase(),
        publisher: cleanText(body.publisher),
        publicationYear: body.publicationYear ? Number(body.publicationYear) : null,
        language: cleanText(body.language),
        description: cleanText(body.description),
        coverImage: cleanText(body.coverImage),
        totalCopies: Number(body.totalCopies),
        featured: body.featured === true || body.featured === 'true',
    };

    if (!book.title) errors.push('Book title is required.');
    if (book.title.length > 200) errors.push('Book title must be under 200 characters.');
    if (!book.author) errors.push('Author name is required.');
    if (book.author.length > 150) errors.push('Author name must be under 150 characters.');
    if (!book.category) {
        errors.push('Category is required.');
    } else {
        const categoryExists = await getDB().collection('categories').findOne({ name: book.category });
        if (!categoryExists) errors.push('Please choose a valid category.');
    }
    if (book.isbn && !/^(\d{9}[\dX]|\d{13})$/.test(book.isbn)) {
        errors.push('ISBN must be 10 or 13 digits (hyphens are allowed).');
    }
    if (book.publisher.length > 150) errors.push('Publisher must be under 150 characters.');
    if (book.publicationYear !== null) {
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(book.publicationYear) || book.publicationYear < 1000 || book.publicationYear > currentYear) {
            errors.push(`Publication year must be between 1000 and ${currentYear}.`);
        }
    }
    if (book.language.length > 50) errors.push('Language must be under 50 characters.');
    if (book.description.length > 3000) errors.push('Description must be under 3000 characters.');
    if (book.coverImage && !/^https?:\/\/\S+$/i.test(book.coverImage)) {
        errors.push('Cover image must be a valid http(s) URL.');
    }
    if (!Number.isInteger(book.totalCopies) || book.totalCopies < 1 || book.totalCopies > 1000) {
        errors.push('Total copies must be a whole number between 1 and 1000.');
    }

    return { errors, book };
};

const getBooks = async (req, res) => {
    const { search, category, author, availability, featured, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const query = { ...availabilityQuery(availability) };

    if (search && search.trim()) {
        const text = search.trim();
        const regex = new RegExp(escapeRegex(text), 'i');
        query.$or = [
            { title: regex },
            { author: regex },
            { category: regex },
            { description: regex },
            { isbn: new RegExp(escapeRegex(text.replace(/[-\s]/g, '')), 'i') },
        ];
    }
    if (category) query.category = category;
    if (author) query.author = author;
    if (featured === 'true') query.featured = true;

    const [total, books] = await Promise.all([
        booksCollection().countDocuments(query),
        booksCollection()
            .find(query)
            .sort(sortOptions[sort] || sortOptions.newest)
            .skip(skip)
            .limit(limit)
            .toArray(),
    ]);

    res.json({
        success: true,
        data: {
            books: books.map(withAvailability),
            total,
            page,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        },
    });
};

const getAuthors = async (req, res) => {
    const authors = await booksCollection().distinct('author');
    authors.sort((a, b) => a.localeCompare(b));
    res.json({ success: true, data: authors });
};

const getBookById = async (req, res) => {
    const id = toObjectId(req.params.id);
    const book = id ? await booksCollection().findOne({ _id: id }) : null;

    if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    res.json({ success: true, data: withAvailability(book) });
};

const createBook = async (req, res) => {
    const { errors, book } = await validateBook(req.body);
    if (errors.length) {
        return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const now = new Date();
    const newBook = {
        ...book,
        availableCopies: book.totalCopies,
        issuedCopies: 0,
        createdAt: now,
        updatedAt: now,
    };

    const result = await booksCollection().insertOne(newBook);
    res.status(201).json({
        success: true,
        message: 'Book added successfully.',
        data: withAvailability({ _id: result.insertedId, ...newBook }),
    });
};

const updateBook = async (req, res) => {
    const id = toObjectId(req.params.id);
    const existing = id ? await booksCollection().findOne({ _id: id }) : null;
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const { errors, book } = await validateBook(req.body);
    if (!errors.length && book.totalCopies < existing.issuedCopies) {
        errors.push(`Total copies cannot be less than the ${existing.issuedCopies} copies currently issued.`);
    }
    if (errors.length) {
        return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const updates = {
        ...book,
        availableCopies: book.totalCopies - existing.issuedCopies,
        updatedAt: new Date(),
    };

    // Only update if no issue/return happened since we read the book
    const result = await booksCollection().updateOne(
        { _id: id, issuedCopies: existing.issuedCopies },
        { $set: updates }
    );
    if (result.matchedCount === 0) {
        return res.status(409).json({ success: false, message: 'This book was just issued or returned. Please try again.' });
    }

    res.json({
        success: true,
        message: 'Book updated successfully.',
        data: withAvailability({ ...existing, ...updates }),
    });
};

const deleteBook = async (req, res) => {
    const id = toObjectId(req.params.id);
    const book = id ? await booksCollection().findOne({ _id: id }) : null;
    if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const activeIssues = await issuesCollection().countDocuments({ bookId: id, status: 'issued' });
    if (activeIssues > 0 || book.issuedCopies > 0) {
        return res.status(400).json({
            success: false,
            message: `"${book.title}" has ${activeIssues || book.issuedCopies} copy(s) currently issued. Return them before deleting.`,
        });
    }

    await booksCollection().deleteOne({ _id: id, issuedCopies: 0 });

    // Students waiting for this book are told it was removed
    await getDB()
        .collection('requests')
        .updateMany(
            { bookId: id, status: 'pending' },
            { $set: { status: 'rejected', note: 'This book was removed from the catalog.', processedAt: new Date(), updatedAt: new Date() } }
        );

    res.json({ success: true, message: `"${book.title}" was deleted.` });
};

module.exports = { getBooks, getAuthors, getBookById, createBook, updateBook, deleteBook };
