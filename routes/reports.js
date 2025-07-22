const express = require('express');
const Donation = require('../models/Donation');
const Charity = require('../models/Charity');
const FoodSlot = require('../models/FoodSlot');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/dashboard
// @desc    Get dashboard overview statistics
// @access  Private (Admin only)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // General Statistics
    const totalCharities = await Charity.countDocuments({ isActive: true });
    const totalDonations = await Donation.countDocuments();
    const totalFoodSlots = await FoodSlot.countDocuments();
    const totalNotifications = await Notification.countDocuments();

    // Monetary Donations
    const totalMonetaryDonations = await Donation.aggregate([
      { $match: { donationType: 'money', status: { $in: ['confirmed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyMonetaryDonations = await Donation.aggregate([
      { 
        $match: { 
          donationType: 'money', 
          status: { $in: ['confirmed', 'delivered'] },
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Donation Status Distribution
    const donationsByStatus = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Donations by Type
    const donationsByType = await Donation.aggregate([
      { $group: { _id: '$donationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Food Slots Statistics
    const activeFoodSlots = await FoodSlot.countDocuments({ status: 'active' });
    const totalBookings = await FoodSlot.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBookings' } } }
    ]);

    // Top Charities by Donations Received
    const topCharitiesByDonations = await Donation.aggregate([
      { $match: { status: { $in: ['confirmed', 'delivered'] } } },
      { $group: { _id: '$charityId', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'charities',
          localField: '_id',
          foreignField: '_id',
          as: 'charity'
        }
      },
      { $unwind: '$charity' },
      {
        $project: {
          name: '$charity.name',
          category: '$charity.category',
          logo: '$charity.logo',
          donationCount: '$count',
          totalAmount: '$totalAmount'
        }
      }
    ]);

    // Recent Activities
    const recentDonations = await Donation.find()
      .populate('charityId', 'name logo')
      .select('donorName donationType amount status createdAt isAnonymous')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFoodSlots = await FoodSlot.find()
      .populate('charityId', 'name logo')
      .select('title mealType date maxCapacity currentBookings status')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly Trend Data for Charts (last 6 months)
    const monthlyTrends = await Donation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalCharities,
          totalDonations,
          totalFoodSlots,
          totalNotifications,
          activeFoodSlots,
          totalBookings: totalBookings[0]?.total || 0,
          totalMonetaryAmount: totalMonetaryDonations[0]?.total || 0,
          monthlyMonetaryAmount: monthlyMonetaryDonations[0]?.total || 0
        },
        distributions: {
          donationsByStatus,
          donationsByType
        },
        topCharities: topCharitiesByDonations,
        recentActivities: {
          donations: recentDonations,
          foodSlots: recentFoodSlots
        },
        trends: {
          monthly: monthlyTrends
        }
      }
    });

  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({
      message: 'Server error generating dashboard report',
      success: false
    });
  }
});

// @route   GET /api/reports/donations
// @desc    Get detailed donations report
// @access  Private (Admin only)
router.get('/donations', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, charityId, donationType, status } = req.query;

    // Build query
    let query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (charityId) {
      query.charityId = charityId;
    }
    
    if (donationType && donationType !== 'all') {
      query.donationType = donationType;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Summary Statistics
    const totalDonations = await Donation.countDocuments(query);
    
    const monetaryTotal = await Donation.aggregate([
      { $match: { ...query, donationType: 'money' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const averageDonation = await Donation.aggregate([
      { $match: { ...query, donationType: 'money', amount: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$amount' } } }
    ]);

    // Donations by Charity
    const donationsByCharity = await Donation.aggregate([
      { $match: query },
      { $group: { _id: '$charityId', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'charities',
          localField: '_id',
          foreignField: '_id',
          as: 'charity'
        }
      },
      { $unwind: '$charity' },
      {
        $project: {
          charityName: '$charity.name',
          category: '$charity.category',
          count: 1,
          totalAmount: 1
        }
      }
    ]);

    // Donations by Type
    const donationsByTypeDetailed = await Donation.aggregate([
      { $match: query },
      { $group: { _id: '$donationType', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } }
    ]);

    // Daily Trend (if date range is within 30 days)
    let dailyTrend = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 30) {
        dailyTrend = await Donation.aggregate([
          { $match: query },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
      }
    }

    // Top Donors (excluding anonymous)
    const topDonors = await Donation.aggregate([
      { 
        $match: { 
          ...query, 
          isAnonymous: false,
          donationType: 'money',
          amount: { $gt: 0 }
        }
      },
      { $group: { _id: '$donorEmail', name: { $first: '$donorName' }, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      report: {
        summary: {
          totalDonations,
          totalMonetaryAmount: monetaryTotal[0]?.total || 0,
          averageDonation: averageDonation[0]?.avg || 0
        },
        breakdowns: {
          byCharity: donationsByCharity,
          byType: donationsByTypeDetailed,
          topDonors
        },
        trends: {
          daily: dailyTrend
        }
      }
    });

  } catch (error) {
    console.error('Donations report error:', error);
    res.status(500).json({
      message: 'Server error generating donations report',
      success: false
    });
  }
});

// @route   GET /api/reports/food-slots
// @desc    Get food slots report
// @access  Private (Admin only)
router.get('/food-slots', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, charityId, mealType, status } = req.query;

    // Build query
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (charityId) {
      query.charityId = charityId;
    }
    
    if (mealType && mealType !== 'all') {
      query.mealType = mealType;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Summary Statistics
    const totalSlots = await FoodSlot.countDocuments(query);
    const totalCapacity = await FoodSlot.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$maxCapacity' } } }
    ]);
    
    const totalBookings = await FoodSlot.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$currentBookings' } } }
    ]);

    const utilizationRate = totalCapacity[0]?.total > 0 
      ? ((totalBookings[0]?.total || 0) / totalCapacity[0].total * 100).toFixed(2)
      : 0;

    // Slots by Charity
    const slotsByCharity = await FoodSlot.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$charityId', 
          count: { $sum: 1 }, 
          totalCapacity: { $sum: '$maxCapacity' },
          totalBookings: { $sum: '$currentBookings' }
        }
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'charities',
          localField: '_id',
          foreignField: '_id',
          as: 'charity'
        }
      },
      { $unwind: '$charity' },
      {
        $project: {
          charityName: '$charity.name',
          category: '$charity.category',
          count: 1,
          totalCapacity: 1,
          totalBookings: 1,
          utilizationRate: {
            $multiply: [
              { $divide: ['$totalBookings', '$totalCapacity'] },
              100
            ]
          }
        }
      }
    ]);

    // Slots by Meal Type
    const slotsByMealType = await FoodSlot.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$mealType', 
          count: { $sum: 1 },
          totalCapacity: { $sum: '$maxCapacity' },
          totalBookings: { $sum: '$currentBookings' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Weekly Trends
    const weeklyTrends = await FoodSlot.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            week: { $week: '$date' }
          },
          count: { $sum: 1 },
          totalCapacity: { $sum: '$maxCapacity' },
          totalBookings: { $sum: '$currentBookings' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 } // Last 12 weeks
    ]);

    // Popular Time Slots
    const popularTimeSlots = await FoodSlot.aggregate([
      { $match: query },
      { $group: { _id: '$startTime', count: { $sum: 1 }, avgBookings: { $avg: '$currentBookings' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      report: {
        summary: {
          totalSlots,
          totalCapacity: totalCapacity[0]?.total || 0,
          totalBookings: totalBookings[0]?.total || 0,
          utilizationRate: parseFloat(utilizationRate)
        },
        breakdowns: {
          byCharity: slotsByCharity,
          byMealType: slotsByMealType,
          popularTimeSlots
        },
        trends: {
          weekly: weeklyTrends
        }
      }
    });

  } catch (error) {
    console.error('Food slots report error:', error);
    res.status(500).json({
      message: 'Server error generating food slots report',
      success: false
    });
  }
});

// @route   GET /api/reports/charities
// @desc    Get charities performance report
// @access  Private (Admin only)
router.get('/charities', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;

    // Build query
    let query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    // Charity Performance Metrics
    const charitiesWithMetrics = await Charity.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'donations',
          let: { charityId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$charityId', '$$charityId'] } } },
            {
              $group: {
                _id: null,
                totalDonations: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' },
                confirmedDonations: {
                  $sum: { $cond: [{ $in: ['$status', ['confirmed', 'delivered']] }, 1, 0] }
                }
              }
            }
          ],
          as: 'donationStats'
        }
      },
      {
        $lookup: {
          from: 'foodslots',
          let: { charityId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$charityId', '$$charityId'] } } },
            {
              $group: {
                _id: null,
                totalSlots: { $sum: 1 },
                totalCapacity: { $sum: '$maxCapacity' },
                totalBookings: { $sum: '$currentBookings' },
                activeSlots: {
                  $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                }
              }
            }
          ],
          as: 'foodSlotStats'
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          contactEmail: 1,
          targetAmount: 1,
          raisedAmount: 1,
          createdAt: 1,
          donationStats: { $arrayElemAt: ['$donationStats', 0] },
          foodSlotStats: { $arrayElemAt: ['$foodSlotStats', 0] },
          progressPercentage: {
            $cond: [
              { $gt: ['$targetAmount', 0] },
              { $multiply: [{ $divide: ['$raisedAmount', '$targetAmount'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { 'donationStats.totalDonations': -1 } }
    ]);

    // Category Distribution
    const categoryDistribution = await Charity.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Goal Achievement Analysis
    const goalAchievement = await Charity.aggregate([
      { $match: { isActive: true, targetAmount: { $gt: 0 } } },
      {
        $project: {
          name: 1,
          targetAmount: 1,
          raisedAmount: 1,
          progressPercentage: {
            $multiply: [{ $divide: ['$raisedAmount', '$targetAmount'] }, 100]
          },
          achievementStatus: {
            $switch: {
              branches: [
                { case: { $gte: [{ $divide: ['$raisedAmount', '$targetAmount'] }, 1] }, then: 'Achieved' },
                { case: { $gte: [{ $divide: ['$raisedAmount', '$targetAmount'] }, 0.75] }, then: 'Near Goal' },
                { case: { $gte: [{ $divide: ['$raisedAmount', '$targetAmount'] }, 0.25] }, then: 'In Progress' }
              ],
              default: 'Starting'
            }
          }
        }
      },
      { $group: { _id: '$achievementStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      report: {
        charities: charitiesWithMetrics,
        summary: {
          totalCharities: charitiesWithMetrics.length,
          categoryDistribution,
          goalAchievement
        }
      }
    });

  } catch (error) {
    console.error('Charities report error:', error);
    res.status(500).json({
      message: 'Server error generating charities report',
      success: false
    });
  }
});

// @route   GET /api/reports/export/donations
// @desc    Export donations data as CSV format data
// @access  Private (Admin only)
router.get('/export/donations', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, charityId, donationType, status } = req.query;

    // Build query
    let query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (charityId) query.charityId = charityId;
    if (donationType && donationType !== 'all') query.donationType = donationType;
    if (status && status !== 'all') query.status = status;

    const donations = await Donation.find(query)
      .populate('charityId', 'name category')
      .select('donorName donorEmail donationType amount description status createdAt isAnonymous charityId')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = donations.map(donation => ({
      'Donor Name': donation.isAnonymous ? 'Anonymous' : donation.donorName,
      'Donor Email': donation.isAnonymous ? 'Anonymous' : donation.donorEmail,
      'Charity': donation.charityId.name,
      'Category': donation.charityId.category,
      'Donation Type': donation.donationType,
      'Amount': donation.amount || 0,
      'Description': donation.description,
      'Status': donation.status,
      'Date': donation.createdAt.toISOString().split('T')[0]
    }));

    res.json({
      success: true,
      data: csvData,
      filename: `donations_export_${new Date().toISOString().split('T')[0]}.csv`
    });

  } catch (error) {
    console.error('Export donations error:', error);
    res.status(500).json({
      message: 'Server error exporting donations data',
      success: false
    });
  }
});

// @route   GET /api/reports/analytics/trends
// @desc    Get advanced analytics and trends
// @access  Private (Admin only)
router.get('/analytics/trends', authMiddleware, async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate;
    const today = new Date();
    
    switch (period) {
      case '1month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        break;
      case '3months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      case '1year':
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        break;
      default: // 6months
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    }

    // Donation trends over time
    const donationTrends = await Donation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$donationType'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Charity growth over time
    const charityGrowth = await Charity.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCharities: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Seasonal patterns for food slots
    const seasonalPatterns = await FoodSlot.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            mealType: '$mealType'
          },
          count: { $sum: 1 },
          avgBookings: { $avg: '$currentBookings' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        donationTrends,
        charityGrowth,
        seasonalPatterns,
        period
      }
    });

  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({
      message: 'Server error generating analytics trends',
      success: false
    });
  }
});

module.exports = router;