const router = require('express').Router();
const r = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.get('/mine', protect, authorize('receiver'), r.getMyRequests);
router.get('/received', protect, authorize('donor'), r.getReceivedRequests);
router.patch('/:id/approve', protect, authorize('donor'), r.approveRequest);
router.patch('/:id/reject', protect, authorize('donor'), r.rejectRequest);

module.exports = router;
