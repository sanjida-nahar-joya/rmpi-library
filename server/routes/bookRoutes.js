const express = require('express');
const {
    getBooks,
    getAuthors,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
} = require('../controllers/bookController');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', getBooks);
router.get('/authors', getAuthors);
router.get('/:id', getBookById);
router.post('/', verifyToken, verifyAdmin, createBook);
router.put('/:id', verifyToken, verifyAdmin, updateBook);
router.delete('/:id', verifyToken, verifyAdmin, deleteBook);

module.exports = router;
