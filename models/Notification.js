const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['donation', 'food_slot', 'general', 'urgent', 'system']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent']
  },
  recipients: [{
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charity',
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  }],
  sender: {
    type: String,
    default: 'System'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['donation', 'foodslot', 'charity', 'admin']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Additional data related to the notification
  },
  isGlobal: {
    type: Boolean,
    default: false // If true, send to all active charities
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  deliveryMethod: {
    type: [String],
    default: ['in_app'],
    enum: ['in_app', 'email', 'sms', 'push']
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
notificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Mark notification as sent
notificationSchema.methods.markAsSent = function() {
  this.isSent = true;
  this.sentAt = new Date();
  return this.save();
};

// Mark as read for a specific charity
notificationSchema.methods.markAsRead = function(charityId) {
  const recipient = this.recipients.find(r => r.charityId.toString() === charityId.toString());
  if (recipient) {
    recipient.isRead = true;
    recipient.readAt = new Date();
  }
  return this.save();
};

// Index for better query performance
notificationSchema.index({ 'recipients.charityId': 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ scheduledFor: 1, isSent: 1 });
notificationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);