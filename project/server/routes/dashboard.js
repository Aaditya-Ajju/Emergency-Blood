import express from 'express'
import BloodRequest from '../models/BloodRequest.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    let stats = {}

    if (userRole === 'donor') {
      // Donor statistics
      const totalRequests = await BloodRequest.countDocuments({
        bloodGroup: req.user.bloodGroup,
        city: req.user.city,
        status: 'active'
      })

      const totalDonations = await BloodRequest.countDocuments({
        'donors.donor': userId,
        'donors.status': 'donated'
      })

      const activeRequests = await BloodRequest.countDocuments({
        bloodGroup: req.user.bloodGroup,
        status: 'active'
      })

      const nearbyRequests = await BloodRequest.countDocuments({
        bloodGroup: req.user.bloodGroup,
        city: req.user.city,
        status: 'active'
      })

      stats = {
        totalRequests,
        totalDonations,
        activeRequests,
        nearbyRequests
      }
    } else {
      // Receiver statistics
      const totalRequests = await BloodRequest.countDocuments({
        requestedBy: userId
      })

      const totalDonations = await BloodRequest.countDocuments({
        requestedBy: userId,
        status: 'completed'
      })

      const activeRequests = await BloodRequest.countDocuments({
        requestedBy: userId,
        status: 'active'
      })

      const nearbyRequests = await BloodRequest.countDocuments({
        city: req.user.city,
        status: 'active'
      })

      stats = {
        totalRequests,
        totalDonations,
        activeRequests,
        nearbyRequests
      }
    }

    res.json(stats)
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get recent requests for dashboard
// @route   GET /api/dashboard/recent-requests
// @access  Private
router.get('/recent-requests', protect, async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    let requests = []

    if (userRole === 'donor') {
      // Get nearby requests for donor
      requests = await BloodRequest.find({
        bloodGroup: req.user.bloodGroup,
        city: req.user.city,
        status: 'active'
      })
        .populate('requestedBy', 'name phone')
        .sort({ createdAt: -1 })
        .limit(10)
    } else {
      // Get user's own requests
      requests = await BloodRequest.find({
        requestedBy: userId
      })
        .populate('requestedBy', 'name phone')
        .sort({ createdAt: -1 })
        .limit(10)
    }

    res.json(requests)
  } catch (error) {
    console.error('Get recent requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get donation history
// @route   GET /api/dashboard/donation-history
// @access  Private
router.get('/donation-history', protect, async (req, res) => {
  try {
    const userId = req.user.id

    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can view donation history' })
    }

    const donations = await BloodRequest.find({
      'donors.donor': userId,
      'donors.status': 'donated'
    })
      .populate('requestedBy', 'name phone')
      .sort({ createdAt: -1 })

    const donationHistory = donations.map(request => {
      const donorInfo = request.donors.find(d => d.donor.toString() === userId)
      return {
        _id: request._id,
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        unitsNeeded: request.unitsNeeded,
        hospitalName: request.hospitalName,
        city: request.city,
        state: request.state,
        donationDate: donorInfo.responseDate,
        requestedBy: request.requestedBy
      }
    })

    res.json(donationHistory)
  } catch (error) {
    console.error('Get donation history error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get public platform stats
// @route   GET /api/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalRequests = await BloodRequest.countDocuments();
    const completedRequests = await BloodRequest.countDocuments({ status: 'completed' });
    const cities = await User.distinct('city');
    const citiesCovered = cities.length;
    const successRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;
    res.json({
      totalUsers,
      totalDonors,
      totalRequests,
      citiesCovered,
      successRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

export default router