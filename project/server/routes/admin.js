import express from 'express'
import BloodRequest from '../models/BloodRequest.js'
import User from '../models/User.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalDonors = await User.countDocuments({ role: 'donor' })
    const totalReceivers = await User.countDocuments({ role: 'receiver' })
    const totalRequests = await BloodRequest.countDocuments()
    const activeRequests = await BloodRequest.countDocuments({ status: 'active' })
    const completedRequests = await BloodRequest.countDocuments({ status: 'completed' })
    const emergencyRequests = await BloodRequest.countDocuments({ urgency: 'high' })

    const stats = {
      totalUsers,
      totalDonors,
      totalReceivers,
      totalRequests,
      activeRequests,
      completedRequests,
      emergencyRequests,
      successRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
    }

    res.json(stats)
  } catch (error) {
    console.error('Get admin stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get recent requests for admin
// @route   GET /api/admin/recent-requests
// @access  Private/Admin
router.get('/recent-requests', protect, authorize('admin'), async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requestedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(requests)
  } catch (error) {
    console.error('Get admin recent requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      role,
      bloodGroup,
      city,
      state,
      page = 1,
      limit = 20
    } = req.query

    const filter = {}

    if (role) {
      filter.role = role
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup
    }

    if (city) {
      filter.city = new RegExp(city, 'i')
    }

    if (state) {
      filter.state = new RegExp(state, 'i')
    }

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get all blood requests for admin
// @route   GET /api/admin/blood-requests
// @access  Private/Admin
router.get('/blood-requests', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      status,
      urgency,
      bloodGroup,
      city,
      state,
      page = 1,
      limit = 20
    } = req.query

    const filter = {}

    if (status) {
      filter.status = status
    }

    if (urgency) {
      filter.urgency = urgency
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup
    }

    if (city) {
      filter.city = new RegExp(city, 'i')
    }

    if (state) {
      filter.state = new RegExp(state, 'i')
    }

    const requests = await BloodRequest.find(filter)
      .populate('requestedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await BloodRequest.countDocuments(filter)

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get admin blood requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isVerified, isAvailable } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isVerified, isAvailable } },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      message: 'User status updated successfully',
      user
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Flag blood request
// @route   PUT /api/admin/blood-requests/:id/flag
// @access  Private/Admin
router.put('/blood-requests/:id/flag', protect, authorize('admin'), async (req, res) => {
  try {
    const { isFlagged, flagReason } = req.body

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { isFlagged, flagReason } },
      { new: true }
    )

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    res.json({
      message: 'Blood request flagged successfully',
      request
    })
  } catch (error) {
    console.error('Flag blood request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get all blood requests (no pagination) for admin table view
// @route   GET /api/admin/all-requests
// @access  Private/Admin
router.get('/all-requests', protect, authorize('admin'), async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requestedBy', 'name email phone')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (error) {
    console.error('Get all admin requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router