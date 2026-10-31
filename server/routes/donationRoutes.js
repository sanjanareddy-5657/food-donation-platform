const router = require('express').Router();
const d = require('../controllers/donationController');
const { createRequest } = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, d.getDonations);
router.post('/', protect, authorize('donor'), d.createDonation);
router.get('/mine', protect, authorize('donor'), d.getMyDonations); // must be before '/:id'
router.get('/:id', protect, d.getDonation);
router.put('/:id', protect, authorize('donor', 'admin'), d.updateDonation);
router.delete('/:id', protect, authorize('donor', 'admin'), d.deleteDonation);
router.patch('/:id/collected', protect, authorize('donor'), d.markCollected);
router.post('/:id/request', protect, authorize('receiver'), createRequest);

module.exports = router;
