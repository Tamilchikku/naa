const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  donorPhone: {
    type: String
  },
  charityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  donationType: {
    type: String,
    required: true,
    enum: ['money', 'food', 'clothes', 'books', 'toys', 'medicine', 'other']
  },
  amount: {
    type: Number,
    default: 0 // For monetary donations
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1 // For non-monetary donations
  },
  unit: {
    type: String,
    default: 'items' // kg, liters, items, etc.
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'delivered', 'cancelled']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'in_kind']
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'refunded']
  },
  transactionId: {
    type: String
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isPickupRequired: {
    type: Boolean,
    default: false
  },
  pickupDate: {
    type: Date
  },
  pickupTime: {
    type: String
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
donationSchema.index({ charityId: 1, createdAt: -1 });
donationSchema.index({ donorEmail: 1 });
donationSchema.index({ status: 1 });

module.exports = mongoose.model('Donation', donationSchema);