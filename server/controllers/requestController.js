const Donation = require('../models/Donation');
const Request = require('../models/Request');

// POST /api/donations/:id/request  (receiver)
exports.createRequest = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.status === 'available' && donation.expiryTime <= new Date()) {
      donation.status = 'expired';
      await donation.save();
    }
    if (donation.status !== 'available') {
      return res.status(409).json({ message: `Donation is ${donation.status}, cannot request` });
    }
    if (donation.donor.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own donation' });
    }

    const request = await Request.create({
      donation: donation._id,
      receiver: req.user._id,
      message: req.body.message,
    });
    res.status(201).json(request);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You already requested this donation' });
    next(err);
  }
};

// GET /api/requests/mine  (receiver)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ receiver: req.user._id })
      .populate('donation', 'title foodType quantity city pickupAddress status expiryTime')
      .sort('-createdAt');
    res.json({ count: requests.length, requests });
  } catch (err) {
    next(err);
  }
};

// GET /api/requests/received  (donor: requests on my donations)
exports.getReceivedRequests = async (req, res, next) => {
  try {
    const myDonations = await Donation.find({ donor: req.user._id }).select('_id');
    const requests = await Request.find({ donation: { $in: myDonations.map((d) => d._id) } })
      .populate('donation', 'title quantity status')
      .populate('receiver', 'name phone city email')
      .sort('-createdAt');
    res.json({ count: requests.length, requests });
  } catch (err) {
    next(err);
  }
};

// loads a request and checks that the logged in donor owns the donation
const loadForDonor = async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404).json({ message: 'Request not found' });
    return {};
  }
  const donation = await Donation.findById(request.donation);
  if (!donation || donation.donor.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: 'This request is not on your donation' });
    return {};
  }
  return { request, donation };
};

// PATCH /api/requests/:id/approve  (donor)
exports.approveRequest = async (req, res, next) => {
  try {
    const { request, donation } = await loadForDonor(req, res);
    if (!request) return;
    if (request.status !== 'pending') {
      return res.status(409).json({ message: `Request is already ${request.status}` });
    }
    if (donation.status !== 'available') {
      return res.status(409).json({ message: `Donation is ${donation.status}, cannot approve` });
    }

    request.status = 'approved';
    await request.save();
    donation.status = 'approved';
    await donation.save();
    // business rule: all other pending requests for this donation are rejected
    await Request.updateMany(
      { donation: donation._id, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected' }
    );
    res.json({ message: 'Request approved', request, donation });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/requests/:id/reject  (donor)
exports.rejectRequest = async (req, res, next) => {
  try {
    const { request } = await loadForDonor(req, res);
    if (!request) return;
    if (request.status !== 'pending') {
      return res.status(409).json({ message: `Request is already ${request.status}` });
    }
    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Request rejected', request });
  } catch (err) {
    next(err);
  }
};
