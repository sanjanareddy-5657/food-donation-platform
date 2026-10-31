const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donation = require('../models/Donation');

// Creates demo accounts + sample donations only when the database is empty.
module.exports = async () => {
  if ((await User.countDocuments()) > 0) return;
  const hash = await bcrypt.hash('demo123', 10);
  const donor = await User.create({ name: 'Demo Donor', email: 'donor@demo.com', password: hash, role: 'donor', city: 'Hyderabad', phone: '9999900001' });
  await User.create({ name: 'Demo Receiver', email: 'receiver@demo.com', password: hash, role: 'receiver', city: 'Hyderabad', phone: '9999900002' });
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await Donation.create([
    { donor: donor._id, title: 'Veg Biryani (wedding leftovers)', foodType: 'veg', quantity: 30, unit: 'meals', pickupAddress: 'Function Hall, Kukatpally', city: 'Hyderabad', expiryTime: tomorrow },
    { donor: donor._id, title: 'Bread and fruit packs', foodType: 'packaged', quantity: 15, unit: 'packs', pickupAddress: 'Bakery, Madhapur', city: 'Hyderabad', expiryTime: tomorrow },
  ]);
  console.log('Seeded demo data -> donor@demo.com / receiver@demo.com (password: demo123)');
};
