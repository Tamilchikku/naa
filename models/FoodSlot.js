const mongoose = require('mongoose');

const foodSlotSchema = new mongoose.Schema({
  charityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage']
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  endTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentBookings: {
    type: Number,
    default: 0
  },
  availableSlots: {
    type: Number,
    default: 0
  },
  servingLocation: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  requirements: {
    type: [String], // e.g., ['vegetarian', 'halal', 'gluten-free']
    default: []
  },
  menu: [{
    itemName: {
      type: String,
      required: true
    },
    description: String,
    quantity: Number,
    unit: String,
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    allergens: [String]
  }],
  donationGoal: {
    type: Number,
    default: 0 // Target amount needed for this slot
  },
  raisedAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'cancelled', 'postponed']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  volunteers: [{
    name: String,
    email: String,
    phone: String,
    role: String
  }],
  specialInstructions: {
    type: String
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  bookings: [{
    donorName: String,
    donorEmail: String,
    donorPhone: String,
    numberOfPeople: {
      type: Number,
      default: 1
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      default: 'confirmed',
      enum: ['confirmed', 'cancelled', 'attended']
    },
    specialRequests: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update available slots when bookings change
foodSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.availableSlots = this.maxCapacity - this.currentBookings;
  next();
});

// Index for better query performance
foodSlotSchema.index({ charityId: 1, date: 1, startTime: 1 });
foodSlotSchema.index({ date: 1, status: 1 });
foodSlotSchema.index({ mealType: 1 });

module.exports = mongoose.model('FoodSlot', foodSlotSchema);