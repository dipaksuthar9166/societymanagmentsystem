const express = require('express');
const router = express.Router();
const { requestChildExit, respondToRequest, getExitLogs } = require('../controllers/childSafetyController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/child-exit', protect, getExitLogs);
router.post('/child-exit', protect, requestChildExit);
router.post('/child-exit/:id/respond', protect, respondToRequest);

module.exports = router;
