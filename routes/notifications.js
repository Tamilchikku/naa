const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const Charity = require('../models/Charity');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for admin
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const priority = req.query.priority;

    // Build query
    let query = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const notifications = await Notification.find(query)
      .populate('recipients.charityId', 'name logo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/notifications/charity/:charityId
// @desc    Get notifications for specific charity
// @access  Public (no auth required for charities to see their notifications)
router.get('/charity/:charityId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isRead = req.query.isRead;

    // Build query to find notifications for this charity
    let matchQuery = {
      $or: [
        { isGlobal: true },
        { 'recipients.charityId': req.params.charityId }
      ]
    };

    // Add read status filter if specified
    if (isRead !== undefined) {
      if (isRead === 'true') {
        matchQuery['recipients.isRead'] = true;
      } else if (isRead === 'false') {
        matchQuery['recipients.isRead'] = false;
      }
    }

    const notifications = await Notification.find(matchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(matchQuery);

    // Mark read status for each notification for this charity
    const notificationsWithReadStatus = notifications.map(notification => {
      const recipient = notification.recipients.find(r => 
        r.charityId.toString() === req.params.charityId
      );
      
      const notificationObj = notification.toObject();
      notificationObj.isReadByCharity = recipient ? recipient.isRead : false;
      notificationObj.readAt = recipient ? recipient.readAt : null;
      
      return notificationObj;
    });

    res.json({
      success: true,
      notifications: notificationsWithReadStatus,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });

  } catch (error) {
    console.error('Get charity notifications error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private (Admin only)
router.post('/', authMiddleware, [
  body('title', 'Title is required').not().isEmpty(),
  body('message', 'Message is required').not().isEmpty(),
  body('type', 'Type is required').isIn(['donation', 'food_slot', 'general', 'urgent', 'system']),
  body('priority', 'Priority is required').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
        success: false
      });
    }

    const {
      title,
      message,
      type,
      priority,
      recipients,
      isGlobal,
      scheduledFor,
      expiresAt,
      deliveryMethod,
      data
    } = req.body;

    const notificationData = {
      title,
      message,
      type,
      priority,
      sender: req.admin.username,
      isGlobal: isGlobal || false,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      deliveryMethod: deliveryMethod || ['in_app'],
      data: data || {}
    };

    if (expiresAt) {
      notificationData.expiresAt = new Date(expiresAt);
    }

    // Handle recipients
    if (isGlobal) {
      // Send to all active charities
      const activeCharities = await Charity.find({ isActive: true }, '_id');
      notificationData.recipients = activeCharities.map(charity => ({
        charityId: charity._id,
        isRead: false
      }));
    } else if (recipients && Array.isArray(recipients)) {
      // Send to specific charities
      notificationData.recipients = recipients.map(charityId => ({
        charityId: charityId,
        isRead: false
      }));
    } else {
      return res.status(400).json({
        message: 'Either set isGlobal to true or provide recipients array',
        success: false
      });
    }

    const notification = new Notification(notificationData);
    await notification.save();

    // Mark as sent immediately (for now - could be scheduled later)
    await notification.markAsSent();

    // Send real-time notifications via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      notification.recipients.forEach(recipient => {
        io.to(`charity_${recipient.charityId}`).emit('newNotification', {
          notification: notification
        });
      });
    }

    // Populate charity data for response
    await notification.populate('recipients.charityId', 'name logo');

    res.status(201).json({
      message: 'Notification created and sent successfully',
      success: true,
      notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      message: 'Server error creating notification',
      success: false
    });
  }
});

// @route   PATCH /api/notifications/:id/read/:charityId
// @desc    Mark notification as read for specific charity
// @access  Public (charities can mark their notifications as read)
router.patch('/:id/read/:charityId', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
        success: false
      });
    }

    // Mark as read for this charity
    await notification.markAsRead(req.params.charityId);

    res.json({
      message: 'Notification marked as read',
      success: true
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
        success: false
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Notification deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      message: 'Server error deleting notification',
      success: false
    });
  }
});

// @route   GET /api/notifications/unread/count/:charityId
// @desc    Get unread notification count for charity
// @access  Public
router.get('/unread/count/:charityId', async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      $or: [
        { 
          isGlobal: true,
          'recipients.charityId': req.params.charityId,
          'recipients.isRead': false 
        },
        { 
          'recipients.charityId': req.params.charityId,
          'recipients.isRead': false 
        }
      ]
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   PATCH /api/notifications/mark-all-read/:charityId
// @desc    Mark all notifications as read for charity
// @access  Public
router.patch('/mark-all-read/:charityId', async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { isGlobal: true },
        { 'recipients.charityId': req.params.charityId }
      ]
    });

    // Mark all as read for this charity
    for (const notification of notifications) {
      await notification.markAsRead(req.params.charityId);
    }

    res.json({
      message: 'All notifications marked as read',
      success: true
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/notifications/stats/summary
// @desc    Get notification statistics
// @access  Private (Admin only)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const sentNotifications = await Notification.countDocuments({ isSent: true });
    const pendingNotifications = await Notification.countDocuments({ isSent: false });
    
    const notificationsByType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const notificationsByPriority = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentNotifications = await Notification.find()
      .populate('recipients.charityId', 'name')
      .select('title type priority createdAt isSent')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalNotifications,
        sent: sentNotifications,
        pending: pendingNotifications,
        byType: notificationsByType,
        byPriority: notificationsByPriority,
        recent: recentNotifications
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      message: 'Server error getting notification statistics',
      success: false
    });
  }
});

module.exports = router;