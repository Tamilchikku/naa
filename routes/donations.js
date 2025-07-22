const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Donation = require('../models/Donation');
const Charity = require('../models/Charity');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for donation images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/donations';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `donation-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/donations
// @desc    Get all donations
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const donationType = req.query.donationType;
    const charityId = req.query.charityId;

    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (donationType && donationType !== 'all') {
      query.donationType = donationType;
    }
    if (charityId) {
      query.charityId = charityId;
    }

    const donations = await Donation.find(query)
      .populate('charityId', 'name category logo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      donations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDonations: total
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/donations/charity/:charityId
// @desc    Get donations for specific charity
// @access  Public
router.get('/charity/:charityId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'confirmed';

    const donations = await Donation.find({ 
      charityId: req.params.charityId,
      status: { $in: ['confirmed', 'delivered'] }
    })
    .select('donorName amount donationType description createdAt isAnonymous message')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Donation.countDocuments({ 
      charityId: req.params.charityId,
      status: { $in: ['confirmed', 'delivered'] }
    });

    res.json({
      success: true,
      donations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDonations: total
    });

  } catch (error) {
    console.error('Get charity donations error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Public (no login required)
router.post('/', upload.array('images', 5), [
  body('donorName', 'Donor name is required').not().isEmpty(),
  body('donorEmail', 'Valid email is required').isEmail(),
  body('charityId', 'Charity ID is required').not().isEmpty(),
  body('donationType', 'Donation type is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty()
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

    // Check if charity exists and is active
    const charity = await Charity.findById(req.body.charityId);
    if (!charity || !charity.isActive) {
      return res.status(400).json({
        message: 'Invalid or inactive charity',
        success: false
      });
    }

    const donationData = { ...req.body };
    
    // Add image paths if uploaded
    if (req.files && req.files.length > 0) {
      donationData.images = req.files.map(file => `/uploads/donations/${file.filename}`);
    }

    // Parse delivery address if provided as JSON string
    if (req.body.deliveryAddress && typeof req.body.deliveryAddress === 'string') {
      try {
        donationData.deliveryAddress = JSON.parse(req.body.deliveryAddress);
      } catch (e) {
        console.error('Error parsing delivery address:', e);
      }
    }

    // Convert numeric fields
    if (req.body.amount) {
      donationData.amount = parseFloat(req.body.amount);
    }
    if (req.body.quantity) {
      donationData.quantity = parseInt(req.body.quantity);
    }

    // Convert boolean fields
    donationData.isAnonymous = req.body.isAnonymous === 'true';
    donationData.isPickupRequired = req.body.isPickupRequired === 'true';

    const donation = new Donation(donationData);
    await donation.save();

    // Update charity raised amount if it's a monetary donation
    if (donationData.donationType === 'money' && donationData.amount > 0) {
      charity.raisedAmount += donationData.amount;
      await charity.save();
    }

    // Create notification for the charity
    const notification = new Notification({
      title: 'New Donation Received',
      message: `A new ${donationData.donationType} donation has been received from ${donationData.isAnonymous ? 'Anonymous' : donationData.donorName}`,
      type: 'donation',
      priority: 'medium',
      recipients: [{ charityId: charity._id }],
      relatedEntity: {
        entityType: 'donation',
        entityId: donation._id
      },
      data: {
        donationType: donationData.donationType,
        amount: donationData.amount,
        donorName: donationData.isAnonymous ? 'Anonymous' : donationData.donorName
      }
    });

    await notification.save();

    // Send real-time notification via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.to(`charity_${charity._id}`).emit('newDonation', {
        donation: donation,
        notification: notification
      });
    }

    // Populate charity info for response
    await donation.populate('charityId', 'name category logo');

    res.status(201).json({
      message: 'Donation submitted successfully',
      success: true,
      donation
    });

  } catch (error) {
    console.error('Create donation error:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      });
    }

    res.status(500).json({
      message: 'Server error creating donation',
      success: false
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Private (Admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('charityId', 'name category logo contactEmail contactPhone');
    
    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found',
        success: false
      });
    }

    res.json({
      success: true,
      donation
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   PUT /api/donations/:id/status
// @desc    Update donation status
// @access  Private (Admin only)
router.put('/:id/status', authMiddleware, [
  body('status', 'Valid status is required').isIn(['pending', 'confirmed', 'delivered', 'cancelled'])
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

    const donation = await Donation.findById(req.params.id)
      .populate('charityId', 'name');
    
    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found',
        success: false
      });
    }

    const oldStatus = donation.status;
    donation.status = req.body.status;
    donation.notes = req.body.notes || donation.notes;
    
    await donation.save();

    // Create notification for status change
    const notification = new Notification({
      title: 'Donation Status Updated',
      message: `Donation status changed from ${oldStatus} to ${req.body.status}`,
      type: 'donation',
      priority: 'medium',
      recipients: [{ charityId: donation.charityId._id }],
      relatedEntity: {
        entityType: 'donation',
        entityId: donation._id
      },
      data: {
        oldStatus,
        newStatus: req.body.status,
        donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName
      }
    });

    await notification.save();

    // Send real-time notification
    const io = req.app.get('socketio');
    if (io) {
      io.to(`charity_${donation.charityId._id}`).emit('donationStatusUpdate', {
        donation: donation,
        notification: notification
      });
    }

    res.json({
      message: 'Donation status updated successfully',
      success: true,
      donation
    });

  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      message: 'Server error updating donation status',
      success: false
    });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete donation
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found',
        success: false
      });
    }

    // Delete associated images
    if (donation.images && donation.images.length > 0) {
      donation.images.forEach(imageUrl => {
        const imagePath = path.join(__dirname, '..', imageUrl);
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (unlinkError) {
          console.error('Error deleting image file:', unlinkError);
        }
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Donation deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      message: 'Server error deleting donation',
      success: false
    });
  }
});

// @route   GET /api/donations/stats/summary
// @desc    Get donation statistics
// @access  Private (Admin only)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const confirmedDonations = await Donation.countDocuments({ status: 'confirmed' });
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
    
    const totalMonetaryDonations = await Donation.aggregate([
      { $match: { donationType: 'money', status: { $in: ['confirmed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const donationsByType = await Donation.aggregate([
      { $group: { _id: '$donationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentDonations = await Donation.find()
      .populate('charityId', 'name')
      .select('donorName donationType amount description status createdAt isAnonymous')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalDonations,
        pending: pendingDonations,
        confirmed: confirmedDonations,
        delivered: deliveredDonations,
        totalAmount: totalMonetaryDonations[0]?.total || 0,
        byType: donationsByType,
        recent: recentDonations
      }
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      message: 'Server error getting donation statistics',
      success: false
    });
  }
});

module.exports = router;