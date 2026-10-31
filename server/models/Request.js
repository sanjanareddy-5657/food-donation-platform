const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

// one receiver can request a donation only once
requestSchema.index({ donation: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('Request', requestSchema);
