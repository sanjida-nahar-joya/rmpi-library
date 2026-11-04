const express = require('express');
const { createIssue, getIssues, getIssueById, returnIssue } = require('../controllers/issueController');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.post('/', createIssue);
router.get('/', getIssues);
router.get('/:id', getIssueById);
router.put('/:id/return', returnIssue);

module.exports = router;
