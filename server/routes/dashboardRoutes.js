const express = require('express');
const { getStats, getRecentActivities } = require('../controllers/dashboardController');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

const router = express.Router();

// Stats are public because the home page shows them
router.get('/stats', getStats);
router.get('/recent-activities', verifyToken, verifyAdmin, getRecentActivities);

module.exports = router;
