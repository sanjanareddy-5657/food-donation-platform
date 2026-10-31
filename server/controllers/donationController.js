const Donation = require('../models/Donation');
const Request = require('../models/Request');

// Marks overdue available donations as expired (runs before reads, no cron needed)
const expireOldDonations = () =>
  Donation.updateMany({ status: 'available', expiryTime: { $lt: new Date() } }, { status: 'expired' });

const findOwned = async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404).json({ message: 'Donation not found' });
    return null;
  }
  if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403).json({ message: 'You can only modify your own donations' });
    return null;
  }
  return donation;
};

// POST /api/donations  (donor)
exports.createDonation = async (req, res, next) => {
  try {
    const { title, description, foodType, quantity, unit, pickupAddress, city, expiryTime } = req.body;
    const missing = ['title', 'foodType', 'quantity', 'pickupAddress', 'city', 'expiryTime'].filter((f) => !req.body[f]);
    if (missing.length) return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    if (Number(quantity) < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });
    if (isNaN(new Date(expiryTime)) || new Date(expiryTime) <= new Date()) {
      return res.status(400).json({ message: 'expiryTime must be a valid future date' });
    }

    const donation = await Donation.create({
      donor: req.user._id, title, description, foodType, quantity, unit, pickupAddress, city, expiryTime,
    });
    res.status(201).json(donation);
  } catch (err) {
    next(err);
  }
};

// GET /api/donations?city=&foodType=&status=
exports.getDonations = async (req, res, next) => {
  try {
    await expireOldDonations();
    const filter = { status: req.query.status || 'available' };
    if (req.query.city) {
      const safe = req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.city = new RegExp(`^${safe}$`, 'i');
    }
    if (req.query.foodType) filter.foodType = req.query.foodType;

    const donations = await Donation.find(filter).populate('donor', 'name phone city').sort('-createdAt');
    res.json({ count: donations.length, donations });
  } catch (err) {
    next(err);
  }
};

// GET /api/donations/mine  (donor)
exports.getMyDonations = async (req, res, next) => {
  try {
    await expireOldDonations();
    const donations = await Donation.find({ donor: req.user._id }).sort('-createdAt');
    res.json({ count: donations.length, donations });
  } catch (err) {
    next(err);
  }
};

// GET /api/donations/:id
exports.getDonation = async (req, res, next) => {
  try {
    await expireOldDonations();
    const donation = await Donation.findById(req.params.id).populate('donor', 'name phone city');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

// PUT /api/donations/:id  (owner, only while available)
exports.updateDonation = async (req, res, next) => {
  try {
    const donation = await findOwned(req, res);
    if (!donation) return;
    if (donation.status !== 'available') {
      return res.status(409).json({ message: `Cannot edit a donation that is ${donation.status}` });
    }
    const allowed = ['title', 'description', 'foodType', 'quantity', 'unit', 'pickupAddress', 'city', 'expiryTime'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) donation[f] = req.body[f]; });
    if (donation.expiryTime <= new Date()) {
      return res.status(400).json({ message: 'expiryTime must be in the future' });
    }
    await donation.save();
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/donations/:id  (owner or admin)
exports.deleteDonation = async (req, res, next) => {
  try {
    const donation = await findOwned(req, res);
    if (!donation) return;
    if (donation.status === 'collected') {
      return res.status(409).json({ message: 'Collected donations cannot be deleted' });
    }
    await Request.deleteMany({ donation: donation._id });
    await donation.deleteOne();
    res.json({ message: 'Donation deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/donations/:id/collected  (owner)
exports.markCollected = async (req, res, next) => {
  try {
    const donation = await findOwned(req, res);
    if (!donation) return;
    if (donation.status !== 'approved') {
      return res.status(409).json({ message: 'Only approved donations can be marked as collected' });
    }
    donation.status = 'collected';
    await donation.save();
    res.json(donation);
  } catch (err) {
    next(err);
  }
};
