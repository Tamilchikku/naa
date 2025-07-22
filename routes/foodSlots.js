const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FoodSlot = require('../models/FoodSlot');
const Charity = require('../models/Charity');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for food slot images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/foodslots';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `foodslot-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

// @route   GET /api/food-slots
// @desc    Get all food slots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const charityId = req.query.charityId;
    const mealType = req.query.mealType;
    const date = req.query.date;
    const status = req.query.status || 'active';

    // Build query
    let query = { status };
    
    if (charityId) {
      query.charityId = charityId;
    }
    
    if (mealType && mealType !== 'all') {
      query.mealType = mealType;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    } else {
      // Only show future slots by default
      query.date = { $gte: new Date() };
    }

    const foodSlots = await FoodSlot.find(query)
      .populate('charityId', 'name category logo address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1, startTime: 1 });

    const total = await FoodSlot.countDocuments(query);

    res.json({
      success: true,
      foodSlots,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSlots: total
    });

  } catch (error) {
    console.error('Get food slots error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/food-slots/:id
// @desc    Get single food slot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const foodSlot = await FoodSlot.findById(req.params.id)
      .populate('charityId', 'name category logo contactEmail contactPhone address');
    
    if (!foodSlot) {
      return res.status(404).json({
        message: 'Food slot not found',
        success: false
      });
    }

    res.json({
      success: true,
      foodSlot
    });

  } catch (error) {
    console.error('Get food slot error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   POST /api/food-slots
// @desc    Create a new food slot
// @access  Private (Admin only)
router.post('/', [authMiddleware, upload.array('images', 5)], [
  body('charityId', 'Charity ID is required').not().isEmpty(),
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('mealType', 'Meal type is required').not().isEmpty(),
  body('date', 'Date is required').isISO8601(),
  body('startTime', 'Start time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime', 'End time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('maxCapacity', 'Max capacity is required').isInt({ min: 1 })
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

    const foodSlotData = { ...req.body };
    
    // Add image paths if uploaded
    if (req.files && req.files.length > 0) {
      foodSlotData.images = req.files.map(file => `/uploads/foodslots/${file.filename}`);
    }

    // Parse JSON fields
    if (req.body.servingLocation && typeof req.body.servingLocation === 'string') {
      try {
        foodSlotData.servingLocation = JSON.parse(req.body.servingLocation);
      } catch (e) {
        console.error('Error parsing serving location:', e);
      }
    }

    if (req.body.menu && typeof req.body.menu === 'string') {
      try {
        foodSlotData.menu = JSON.parse(req.body.menu);
      } catch (e) {
        console.error('Error parsing menu:', e);
      }
    }

    if (req.body.requirements && typeof req.body.requirements === 'string') {
      try {
        foodSlotData.requirements = JSON.parse(req.body.requirements);
      } catch (e) {
        console.error('Error parsing requirements:', e);
      }
    }

    if (req.body.volunteers && typeof req.body.volunteers === 'string') {
      try {
        foodSlotData.volunteers = JSON.parse(req.body.volunteers);
      } catch (e) {
        console.error('Error parsing volunteers:', e);
      }
    }

    if (req.body.recurringDays && typeof req.body.recurringDays === 'string') {
      try {
        foodSlotData.recurringDays = JSON.parse(req.body.recurringDays);
      } catch (e) {
        console.error('Error parsing recurring days:', e);
      }
    }

    // Convert numeric fields
    foodSlotData.maxCapacity = parseInt(req.body.maxCapacity);
    if (req.body.donationGoal) {
      foodSlotData.donationGoal = parseFloat(req.body.donationGoal);
    }

    // Convert boolean fields
    foodSlotData.isRecurring = req.body.isRecurring === 'true';

    // Set available slots initially to max capacity
    foodSlotData.availableSlots = foodSlotData.maxCapacity;

    const foodSlot = new FoodSlot(foodSlotData);
    await foodSlot.save();

    // Create notification for all charities about new food slot
    const notification = new Notification({
      title: 'New Food Slot Available',
      message: `A new ${foodSlotData.mealType} slot has been created for ${new Date(foodSlotData.date).toLocaleDateString()}`,
      type: 'food_slot',
      priority: 'medium',
      isGlobal: true,
      relatedEntity: {
        entityType: 'foodslot',
        entityId: foodSlot._id
      },
      data: {
        mealType: foodSlotData.mealType,
        date: foodSlotData.date,
        charityName: charity.name
      }
    });

    // Add all active charities as recipients
    const activeCharities = await Charity.find({ isActive: true }, '_id');
    notification.recipients = activeCharities.map(charity => ({ charityId: charity._id }));
    await notification.save();

    // Send real-time notification via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      activeCharities.forEach(charity => {
        io.to(`charity_${charity._id}`).emit('newFoodSlot', {
          foodSlot: foodSlot,
          notification: notification
        });
      });
    }

    // Populate charity info for response
    await foodSlot.populate('charityId', 'name category logo');

    res.status(201).json({
      message: 'Food slot created successfully',
      success: true,
      foodSlot
    });

  } catch (error) {
    console.error('Create food slot error:', error);
    
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
      message: 'Server error creating food slot',
      success: false
    });
  }
});

// @route   PUT /api/food-slots/:id
// @desc    Update food slot
// @access  Private (Admin only)
router.put('/:id', [authMiddleware, upload.array('images', 5)], async (req, res) => {
  try {
    const foodSlot = await FoodSlot.findById(req.params.id);
    
    if (!foodSlot) {
      return res.status(404).json({
        message: 'Food slot not found',
        success: false
      });
    }

    const updateData = { ...req.body };
    
    // Add new image paths if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images
      if (foodSlot.images && foodSlot.images.length > 0) {
        foodSlot.images.forEach(imageUrl => {
          const imagePath = path.join(__dirname, '..', imageUrl);
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          } catch (unlinkError) {
            console.error('Error deleting old image:', unlinkError);
          }
        });
      }
      updateData.images = req.files.map(file => `/uploads/foodslots/${file.filename}`);
    }

    // Parse JSON fields
    ['servingLocation', 'menu', 'requirements', 'volunteers', 'recurringDays'].forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          updateData[field] = JSON.parse(req.body[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
        }
      }
    });

    // Convert numeric fields
    if (req.body.maxCapacity) {
      updateData.maxCapacity = parseInt(req.body.maxCapacity);
      // Recalculate available slots
      updateData.availableSlots = updateData.maxCapacity - foodSlot.currentBookings;
    }
    if (req.body.donationGoal) {
      updateData.donationGoal = parseFloat(req.body.donationGoal);
    }

    // Convert boolean fields
    if (req.body.isRecurring !== undefined) {
      updateData.isRecurring = req.body.isRecurring === 'true';
    }

    const updatedFoodSlot = await FoodSlot.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('charityId', 'name category logo');

    res.json({
      message: 'Food slot updated successfully',
      success: true,
      foodSlot: updatedFoodSlot
    });

  } catch (error) {
    console.error('Update food slot error:', error);
    
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
      message: 'Server error updating food slot',
      success: false
    });
  }
});

// @route   POST /api/food-slots/:id/book
// @desc    Book a food slot
// @access  Public (no login required)
router.post('/:id/book', [
  body('donorName', 'Donor name is required').not().isEmpty(),
  body('donorEmail', 'Valid email is required').isEmail(),
  body('numberOfPeople', 'Number of people is required').isInt({ min: 1 })
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

    const foodSlot = await FoodSlot.findById(req.params.id)
      .populate('charityId', 'name contactEmail');
    
    if (!foodSlot) {
      return res.status(404).json({
        message: 'Food slot not found',
        success: false
      });
    }

    const { donorName, donorEmail, donorPhone, numberOfPeople, specialRequests } = req.body;
    const numPeople = parseInt(numberOfPeople);

    // Check if slot is still available
    if (foodSlot.status !== 'active') {
      return res.status(400).json({
        message: 'This food slot is no longer active',
        success: false
      });
    }

    // Check if there are enough slots available
    if (foodSlot.availableSlots < numPeople) {
      return res.status(400).json({
        message: `Only ${foodSlot.availableSlots} slots available, but ${numPeople} requested`,
        success: false
      });
    }

    // Check if slot date has passed
    const slotDate = new Date(foodSlot.date);
    const now = new Date();
    if (slotDate < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        message: 'Cannot book past food slots',
        success: false
      });
    }

    // Add booking
    const booking = {
      donorName,
      donorEmail,
      donorPhone,
      numberOfPeople: numPeople,
      specialRequests,
      bookedAt: new Date(),
      status: 'confirmed'
    };

    foodSlot.bookings.push(booking);
    foodSlot.currentBookings += numPeople;
    foodSlot.availableSlots = foodSlot.maxCapacity - foodSlot.currentBookings;

    await foodSlot.save();

    // Create notification for the charity
    const notification = new Notification({
      title: 'New Food Slot Booking',
      message: `${donorName} has booked ${numPeople} slot(s) for ${foodSlot.title}`,
      type: 'food_slot',
      priority: 'medium',
      recipients: [{ charityId: foodSlot.charityId._id }],
      relatedEntity: {
        entityType: 'foodslot',
        entityId: foodSlot._id
      },
      data: {
        donorName,
        numberOfPeople: numPeople,
        slotTitle: foodSlot.title,
        slotDate: foodSlot.date
      }
    });

    await notification.save();

    // Send real-time notification
    const io = req.app.get('socketio');
    if (io) {
      io.to(`charity_${foodSlot.charityId._id}`).emit('newBooking', {
        foodSlot: foodSlot,
        booking: booking,
        notification: notification
      });
    }

    res.status(201).json({
      message: 'Food slot booked successfully',
      success: true,
      booking: booking,
      foodSlot: {
        id: foodSlot._id,
        title: foodSlot.title,
        date: foodSlot.date,
        startTime: foodSlot.startTime,
        endTime: foodSlot.endTime,
        availableSlots: foodSlot.availableSlots
      }
    });

  } catch (error) {
    console.error('Book food slot error:', error);
    res.status(500).json({
      message: 'Server error booking food slot',
      success: false
    });
  }
});

// @route   DELETE /api/food-slots/:id
// @desc    Delete food slot
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const foodSlot = await FoodSlot.findById(req.params.id);
    
    if (!foodSlot) {
      return res.status(404).json({
        message: 'Food slot not found',
        success: false
      });
    }

    // Delete associated images
    if (foodSlot.images && foodSlot.images.length > 0) {
      foodSlot.images.forEach(imageUrl => {
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

    await FoodSlot.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Food slot deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete food slot error:', error);
    res.status(500).json({
      message: 'Server error deleting food slot',
      success: false
    });
  }
});

// @route   PATCH /api/food-slots/:id/status
// @desc    Update food slot status
// @access  Private (Admin only)
router.patch('/:id/status', authMiddleware, [
  body('status', 'Valid status is required').isIn(['active', 'completed', 'cancelled', 'postponed'])
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

    const foodSlot = await FoodSlot.findById(req.params.id)
      .populate('charityId', 'name');
    
    if (!foodSlot) {
      return res.status(404).json({
        message: 'Food slot not found',
        success: false
      });
    }

    const oldStatus = foodSlot.status;
    foodSlot.status = req.body.status;
    
    await foodSlot.save();

    res.json({
      message: `Food slot status updated to ${req.body.status}`,
      success: true,
      foodSlot
    });

  } catch (error) {
    console.error('Update food slot status error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/food-slots/stats/summary
// @desc    Get food slot statistics
// @access  Private (Admin only)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalSlots = await FoodSlot.countDocuments();
    const activeSlots = await FoodSlot.countDocuments({ status: 'active' });
    const completedSlots = await FoodSlot.countDocuments({ status: 'completed' });
    
    const totalBookings = await FoodSlot.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBookings' } } }
    ]);

    const slotsByMealType = await FoodSlot.aggregate([
      { $group: { _id: '$mealType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const upcomingSlots = await FoodSlot.find({
      status: 'active',
      date: { $gte: new Date() }
    })
    .populate('charityId', 'name')
    .select('title mealType date startTime maxCapacity currentBookings')
    .sort({ date: 1 })
    .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalSlots,
        active: activeSlots,
        completed: completedSlots,
        totalBookings: totalBookings[0]?.total || 0,
        byMealType: slotsByMealType,
        upcoming: upcomingSlots
      }
    });

  } catch (error) {
    console.error('Get food slot stats error:', error);
    res.status(500).json({
      message: 'Server error getting food slot statistics',
      success: false
    });
  }
});

module.exports = router;