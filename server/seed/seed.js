require('dotenv').config({ quiet: true });
const { connectDB, getDB, closeDB } = require('../config/db');
const { categories, books, students } = require('./data');

const DAY = 24 * 60 * 60 * 1000;

const daysAgo = (days) => {
    const date = new Date();
    date.setHours(10, 0, 0, 0);
    return new Date(date.getTime() - days * DAY);
};

// Issue and due dates are saved as plain dates, the same way the issue form saves them
const dateOnly = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const seed = async () => {
    await connectDB();
    const db = getDB();

    await db.collection('categories').deleteMany({});
    await db.collection('books').deleteMany({});
    await db.collection('issues').deleteMany({});
    await db.collection('requests').deleteMany({});

    const now = Date.now();
    await db
        .collection('categories')
        .insertMany(categories.map((category, index) => ({ ...category, createdAt: new Date(now + index * 1000) })));

    const bookDocs = books.map((book, index) => {
        const createdAt = daysAgo((index * 7) % books.length);
        return {
            title: book.title,
            author: book.author,
            category: book.category,
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            publicationYear: book.publicationYear || null,
            language: book.language || '',
            description: book.description || '',
            coverImage: book.coverImage || '',
            totalCopies: book.totalCopies,
            availableCopies: book.totalCopies - book.issuedCopies,
            issuedCopies: book.issuedCopies,
            featured: Boolean(book.featured),
            createdAt,
            updatedAt: createdAt,
        };
    });
    const bookResult = await db.collection('books').insertMany(bookDocs);

    const studentDetails = (student) => ({
        studentName: student.name,
        roll: student.roll,
        department: student.department,
        semester: student.semester,
        shift: student.shift,
        phone: student.phone,
        studentAccountId: null,
        requestId: null,
    });

    const issueDocs = [];
    let counter = 0;

    // One active issue record for every issued copy, so the counts always match
    bookDocs.forEach((book, index) => {
        for (let i = 0; i < book.issuedCopies; i++) {
            const student = students[counter % students.length];
            const issueDate = dateOnly(daysAgo(1 + ((counter * 5) % 20)));
            issueDocs.push({
                bookId: bookResult.insertedIds[index],
                bookTitle: book.title,
                bookAuthor: book.author,
                ...studentDetails(student),
                issueDate,
                dueDate: new Date(issueDate.getTime() + 14 * DAY),
                returnDate: null,
                status: 'issued',
                issuedBy: 'sample-data',
                createdAt: new Date(issueDate.getTime() + 4 * 60 * 60 * 1000 + counter * 60 * 1000),
            });
            counter++;
        }
    });

    for (let i = 0; i < 12; i++) {
        const bookIndex = (i * 5 + 3) % bookDocs.length;
        const student = students[(i * 3 + 1) % students.length];
        const issueDate = dateOnly(daysAgo(25 + i * 2));
        issueDocs.push({
            bookId: bookResult.insertedIds[bookIndex],
            bookTitle: bookDocs[bookIndex].title,
            bookAuthor: bookDocs[bookIndex].author,
            ...studentDetails(student),
            issueDate,
            dueDate: new Date(issueDate.getTime() + 14 * DAY),
            returnDate: daysAgo(25 + i * 2 - (7 + (i % 6))),
            status: 'returned',
            issuedBy: 'sample-data',
            returnedBy: 'sample-data',
            createdAt: new Date(issueDate.getTime() + 4 * 60 * 60 * 1000),
        });
    }

    await db.collection('issues').insertMany(issueDocs);

    console.log(`Inserted ${categories.length} categories, ${bookDocs.length} books and ${issueDocs.length} issue records.`);
    console.log('Note: copy counts and issue records are sample demonstration data.');

    const adminCount = await db.collection('admins').countDocuments();
    if (adminCount === 0) {
        console.log('No admin account yet. Run "npm run create-admin" to create one.');
    }

    await closeDB();
};

seed().catch(async (error) => {
    console.error('Seeding failed:', error.message);
    await closeDB();
    process.exit(1);
});
