const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Charity = require('../models/Charity');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/charities';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `charity-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
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

// @route   GET /api/charities
// @desc    Get all charities (public access)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const isActive = req.query.isActive !== 'false';

    // Build query
    let query = { isActive };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const charities = await Charity.find(query)
      .select('-bankDetails') // Exclude sensitive bank details
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Charity.countDocuments(query);

    res.json({
      success: true,
      charities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCharities: total
    });

  } catch (error) {
    console.error('Get charities error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/charities/:id
// @desc    Get single charity
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id).select('-bankDetails');
    
    if (!charity) {
      return res.status(404).json({
        message: 'Charity not found',
        success: false
      });
    }

    res.json({
      success: true,
      charity
    });

  } catch (error) {
    console.error('Get charity error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   POST /api/charities
// @desc    Create a new charity
// @access  Private (Admin only)
router.post('/', [authMiddleware, upload.single('logo')], [
  body('name', 'Charity name is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('category', 'Category is required').not().isEmpty(),
  body('contactEmail', 'Valid email is required').isEmail(),
  body('contactPhone', 'Phone number is required').not().isEmpty()
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

    const charityData = { ...req.body };
    
    // Add logo path if uploaded
    if (req.file) {
      charityData.logo = `/uploads/charities/${req.file.filename}`;
    }

    // Parse address if provided as JSON string
    if (req.body.address && typeof req.body.address === 'string') {
      try {
        charityData.address = JSON.parse(req.body.address);
      } catch (e) {
        console.error('Error parsing address:', e);
      }
    }

    // Parse social media if provided as JSON string
    if (req.body.socialMedia && typeof req.body.socialMedia === 'string') {
      try {
        charityData.socialMedia = JSON.parse(req.body.socialMedia);
      } catch (e) {
        console.error('Error parsing social media:', e);
      }
    }

    // Parse bank details if provided as JSON string
    if (req.body.bankDetails && typeof req.body.bankDetails === 'string') {
      try {
        charityData.bankDetails = JSON.parse(req.body.bankDetails);
      } catch (e) {
        console.error('Error parsing bank details:', e);
      }
    }

    // Generate unique registration number
    charityData.registrationNumber = `CHR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const charity = new Charity(charityData);
    await charity.save();

    res.status(201).json({
      message: 'Charity created successfully',
      success: true,
      charity
    });

  } catch (error) {
    console.error('Create charity error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A charity with this registration number already exists',
        success: false
      });
    }

    res.status(500).json({
      message: 'Server error creating charity',
      success: false
    });
  }
});

// @route   PUT /api/charities/:id
// @desc    Update charity
// @access  Private (Admin only)
router.put('/:id', [authMiddleware, upload.single('logo')], async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    
    if (!charity) {
      return res.status(404).json({
        message: 'Charity not found',
        success: false
      });
    }

    const updateData = { ...req.body };
    
    // Add new logo path if uploaded
    if (req.file) {
      // Delete old logo file
      if (charity.logo) {
        const oldLogoPath = path.join(__dirname, '..', charity.logo);
        try {
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        } catch (unlinkError) {
          console.error('Error deleting old logo:', unlinkError);
        }
      }
      updateData.logo = `/uploads/charities/${req.file.filename}`;
    }

    // Parse JSON strings
    ['address', 'socialMedia', 'bankDetails'].forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          updateData[field] = JSON.parse(req.body[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
        }
      }
    });

    const updatedCharity = await Charity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Charity updated successfully',
      success: true,
      charity: updatedCharity
    });

  } catch (error) {
    console.error('Update charity error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      message: 'Server error updating charity',
      success: false
    });
  }
});

// @route   DELETE /api/charities/:id
// @desc    Delete charity
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    
    if (!charity) {
      return res.status(404).json({
        message: 'Charity not found',
        success: false
      });
    }

    // Delete logo file if exists
    if (charity.logo) {
      const logoPath = path.join(__dirname, '..', charity.logo);
      try {
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      } catch (unlinkError) {
        console.error('Error deleting logo file:', unlinkError);
      }
    }

    await Charity.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Charity deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete charity error:', error);
    res.status(500).json({
      message: 'Server error deleting charity',
      success: false
    });
  }
});

// @route   PATCH /api/charities/:id/toggle-status
// @desc    Toggle charity active status
// @access  Private (Admin only)
router.patch('/:id/toggle-status', authMiddleware, async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    
    if (!charity) {
      return res.status(404).json({
        message: 'Charity not found',
        success: false
      });
    }

    charity.isActive = !charity.isActive;
    await charity.save();

    res.json({
      message: `Charity ${charity.isActive ? 'activated' : 'deactivated'} successfully`,
      success: true,
      charity
    });

  } catch (error) {
    console.error('Toggle charity status error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
});

// @route   GET /api/charities/categories/list
// @desc    Get all charity categories
// @access  Public
router.get('/categories/list', (req, res) => {
  const categories = [
    'Education',
    'Healthcare', 
    'Environment',
    'Poverty',
    'Animals',
    'Disaster Relief',
    'Food & Hunger',
    'Human Rights',
    'Arts & Culture',
    'Other'
  ];

  res.json({
    success: true,
    categories
  });
});

module.exports = router;