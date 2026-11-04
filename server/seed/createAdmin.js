require('dotenv').config({ quiet: true });
const bcrypt = require('bcrypt');
const { connectDB, getDB, closeDB } = require('../config/db');
const { isValidEmail } = require('../utils/helpers');

const createAdmin = async () => {
    const name = (process.env.ADMIN_NAME || 'Librarian').trim();
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';

    if (!isValidEmail(email) || password.length < 8) {
        console.error('Set a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters in server/.env first.');
        process.exit(1);
    }

    await connectDB();
    const passwordHash = await bcrypt.hash(password, 10);

    // Creates the admin, or resets the password if this email already exists
    const result = await getDB()
        .collection('admins')
        .updateOne(
            { email },
            {
                $set: { name, email, passwordHash, role: 'admin', updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true }
        );

    console.log(result.upsertedCount ? `Admin account created for ${email}` : `Admin account updated for ${email}`);
    console.log('You can now log in at http://localhost:5173/login');
    await closeDB();
};

createAdmin().catch(async (error) => {
    console.error('Could not create admin:', error.message);
    await closeDB();
    process.exit(1);
});
