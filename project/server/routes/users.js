import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user.toJSON())
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  body('age').optional().isInt({ min: 18, max: 65 }).withMessage('Age must be between 18 and 65'),
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').optional().trim().isLength({ min: 2 }).withMessage('State is required'),
  body('isAvailable').optional().isBoolean().withMessage('Availability must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const updates = req.body
    delete updates.email // Prevent email updates
    delete updates.role // Prevent role updates

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Update availability status (for donors)
// @route   PUT /api/users/availability
// @access  Private
router.put('/availability', protect, [
  body('isAvailable').isBoolean().withMessage('Availability must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { isAvailable } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isAvailable } },
      { new: true }
    )

    res.json({
      message: 'Availability updated successfully',
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Availability update error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Record donation
// @route   POST /api/users/donation
// @access  Private
router.post('/donation', protect, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can record donations' })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          lastDonation: new Date(),
          isAvailable: false // Make unavailable after donation
        }
      },
      { new: true }
    )

    res.json({
      message: 'Donation recorded successfully',
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Donation record error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name phone bloodGroup city state')
      .populate('relatedRequest', 'patientName bloodGroup hospitalName city state')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// @desc    Mark notification as read
// @route   PATCH /api/users/notifications/:id/read
// @access  Private
router.patch('/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// @desc    Get a single notification
// @route   GET /api/users/notifications/:id
// @access  Private
router.get('/notifications/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id })
      .populate('sender', 'name phone bloodGroup city state')
      .populate('relatedRequest', 'patientName bloodGroup hospitalName city state');
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notification' });
  }
});

export default router