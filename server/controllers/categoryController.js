const { getDB } = require('../config/db');
const { toObjectId, cleanText } = require('../utils/helpers');

const categoriesCollection = () => getDB().collection('categories');
const booksCollection = () => getDB().collection('books');

const validateCategory = (body) => {
    const category = {
        name: cleanText(body.name),
        description: cleanText(body.description),
    };
    let error = null;
    if (!category.name) error = 'Category name is required.';
    else if (category.name.length > 60) error = 'Category name must be under 60 characters.';
    else if (category.description.length > 300) error = 'Description must be under 300 characters.';
    return { error, category };
};

const getCategories = async (req, res) => {
    const [categories, counts] = await Promise.all([
        categoriesCollection().find().sort({ createdAt: 1 }).toArray(),
        booksCollection()
            .aggregate([{ $group: { _id: '$category', bookCount: { $sum: 1 }, availableCopies: { $sum: '$availableCopies' } } }])
            .toArray(),
    ]);

    const data = categories.map((category) => {
        const count = counts.find((item) => item._id === category.name);
        return {
            ...category,
            bookCount: count ? count.bookCount : 0,
            availableCopies: count ? count.availableCopies : 0,
        };
    });

    res.json({ success: true, data });
};

const createCategory = async (req, res) => {
    const { error, category } = validateCategory(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const exists = await categoriesCollection().findOne({ name: category.name });
    if (exists) return res.status(409).json({ success: false, message: 'This category already exists.' });

    const newCategory = { ...category, createdAt: new Date() };
    const result = await categoriesCollection().insertOne(newCategory);
    res.status(201).json({
        success: true,
        message: 'Category created.',
        data: { _id: result.insertedId, ...newCategory, bookCount: 0 },
    });
};

const updateCategory = async (req, res) => {
    const id = toObjectId(req.params.id);
    const existing = id ? await categoriesCollection().findOne({ _id: id }) : null;
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { error, category } = validateCategory(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    if (category.name !== existing.name) {
        const duplicate = await categoriesCollection().findOne({ name: category.name });
        if (duplicate) return res.status(409).json({ success: false, message: 'This category already exists.' });
    }

    await categoriesCollection().updateOne({ _id: id }, { $set: { ...category, updatedAt: new Date() } });

    // Keep books linked to the renamed category
    if (category.name !== existing.name) {
        await booksCollection().updateMany({ category: existing.name }, { $set: { category: category.name } });
    }

    res.json({ success: true, message: 'Category updated.', data: { ...existing, ...category } });
};

const deleteCategory = async (req, res) => {
    const id = toObjectId(req.params.id);
    const category = id ? await categoriesCollection().findOne({ _id: id }) : null;
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const bookCount = await booksCollection().countDocuments({ category: category.name });
    if (bookCount > 0) {
        return res.status(400).json({
            success: false,
            message: `"${category.name}" still has ${bookCount} book(s). Move or delete them first.`,
        });
    }

    await categoriesCollection().deleteOne({ _id: id });
    res.json({ success: true, message: 'Category deleted.' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
