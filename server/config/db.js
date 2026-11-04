const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
    serverSelectionTimeoutMS: 5000,
});

let db;

const createIndexes = async () => {
    await db.collection('books').createIndex({ title: 1 });
    await db.collection('books').createIndex({ category: 1 });
    await db.collection('books').createIndex({ createdAt: -1 });
    await db.collection('books').createIndex(
        { isbn: 1 },
        { unique: true, partialFilterExpression: { isbn: { $type: 'string', $gt: '' } } }
    );
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    await db.collection('students').createIndex({ email: 1 }, { unique: true });
    await db.collection('students').createIndex({ roll: 1, department: 1 }, { unique: true });
    await db.collection('issues').createIndex({ bookId: 1, status: 1 });
    await db.collection('issues').createIndex({ roll: 1, department: 1, status: 1 });
    await db.collection('requests').createIndex({ studentAccountId: 1, createdAt: -1 });
    await db.collection('requests').createIndex({ status: 1, createdAt: 1 });
    await db.collection('messages').createIndex({ createdAt: -1 });
};

const connectDB = async () => {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'library_management');
    await createIndexes();
    console.log(`Connected to MongoDB (database: ${db.databaseName})`);
};

const getDB = () => db;

const closeDB = () => client.close();

module.exports = { connectDB, getDB, closeDB };
