require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const issueRoutes = require('./routes/issueRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contactRoutes = require('./routes/contactRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const studentRoutes = require('./routes/studentRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'RMPI Library server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/requests', requestRoutes);

app.use(notFound);
app.use(errorHandler);

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
}

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`RMPI Library server running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error.message);
        console.error('Make sure MongoDB is running and MONGODB_URI in server/.env is correct.');
        process.exit(1);
    });
