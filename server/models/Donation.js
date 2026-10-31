const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    foodType: { type: String, enum: ['veg', 'non-veg', 'packaged', 'other'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'meals' },
    pickupAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    expiryTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'approved', 'collected', 'expired', 'cancelled'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
