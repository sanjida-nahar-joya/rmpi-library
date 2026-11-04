const express = require('express');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, verifyAdmin, createCategory);
router.put('/:id', verifyToken, verifyAdmin, updateCategory);
router.delete('/:id', verifyToken, verifyAdmin, deleteCategory);

module.exports = router;
