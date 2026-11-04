const express = require('express');
const {
    createRequest,
    getMyRequests,
    cancelRequest,
    getRequests,
    approveRequest,
    rejectRequest,
} = require('../controllers/requestController');
const { verifyToken, verifyAdmin, verifyStudent } = require('../middleware/verifyToken');

const router = express.Router();

router.post('/', verifyToken, verifyStudent, createRequest);
router.get('/my', verifyToken, verifyStudent, getMyRequests);
router.put('/:id/cancel', verifyToken, verifyStudent, cancelRequest);

router.get('/', verifyToken, verifyAdmin, getRequests);
router.put('/:id/approve', verifyToken, verifyAdmin, approveRequest);
router.put('/:id/reject', verifyToken, verifyAdmin, rejectRequest);

module.exports = router;
