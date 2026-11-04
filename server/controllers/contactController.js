const { getDB } = require('../config/db');
const { toObjectId, cleanText, isValidEmail } = require('../utils/helpers');

const messagesCollection = () => getDB().collection('messages');

const createMessage = async (req, res) => {
    const message = {
        name: cleanText(req.body.name),
        email: cleanText(req.body.email).toLowerCase(),
        subject: cleanText(req.body.subject),
        message: cleanText(req.body.message),
    };

    let error = null;
    if (message.name.length < 2 || message.name.length > 100) error = 'Please enter your full name (2 to 100 characters).';
    else if (!isValidEmail(message.email) || message.email.length > 100) error = 'Please enter a valid email address.';
    else if (message.subject.length < 3 || message.subject.length > 150) error = 'Subject must be 3 to 150 characters.';
    else if (message.message.length < 10 || message.message.length > 2000) error = 'Message must be 10 to 2000 characters.';
    if (error) return res.status(400).json({ success: false, message: error });

    await messagesCollection().insertOne({ ...message, isRead: false, createdAt: new Date() });
    res.status(201).json({ success: true, message: 'Thank you! Your message has been received.' });
};

const getMessages = async (req, res) => {
    const messages = await messagesCollection().find().sort({ createdAt: -1 }).limit(200).toArray();
    res.json({ success: true, data: messages });
};

const markAsRead = async (req, res) => {
    const id = toObjectId(req.params.id);
    const result = id ? await messagesCollection().updateOne({ _id: id }, { $set: { isRead: true } }) : null;
    if (!result || result.matchedCount === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Marked as read.' });
};

const deleteMessage = async (req, res) => {
    const id = toObjectId(req.params.id);
    const result = id ? await messagesCollection().deleteOne({ _id: id }) : null;
    if (!result || result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted.' });
};

module.exports = { createMessage, getMessages, markAsRead, deleteMessage };
