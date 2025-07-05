import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      bloodGroup,
      city,
      state,
      availability,
      page = 1,
      limit = 20
    } = req.query

    // Build filter object
    const filter = { role: 'donor' }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup
    }

    if (city) {
      filter.city = new RegExp(city, 'i')
    }

    if (state) {
      filter.state = new RegExp(state, 'i')
    }

    if (availability === 'available') {
      filter.isAvailable = true
    } else if (availability === 'not_available') {
      filter.isAvailable = false
    }

    const donors = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    res.json({
      donors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get donors error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get donors by blood group and location
// @route   GET /api/donors/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { bloodGroup, city, state } = req.query

    if (!bloodGroup) {
      return res.status(400).json({ message: 'Blood group is required' })
    }

    const filter = {
      role: 'donor',
      bloodGroup,
      isAvailable: true
    }

    if (city) {
      filter.city = new RegExp(city, 'i')
    }

    if (state) {
      filter.state = new RegExp(state, 'i')
    }

    const donors = await User.find(filter)
      .select('name phone bloodGroup city state age lastDonation')
      .sort({ lastDonation: 1 }) // Prioritize donors who haven't donated recently

    res.json(donors)
  } catch (error) {
    console.error('Search donors error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get donor by ID
// @route   GET /api/donors/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const donor = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires')

    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' })
    }

    res.json(donor)
  } catch (error) {
    console.error('Get donor error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get nearby donors
// @route   GET /api/donors/nearby
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { bloodGroup, radius = 50 } = req.query
    const userCity = req.user.city
    const userState = req.user.state

    const filter = {
      role: 'donor',
      isAvailable: true,
      state: userState // Same state for now
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup
    }

    const nearbyDonors = await User.find(filter)
      .select('name phone bloodGroup city state age lastDonation')
      .sort({ city: userCity === '$city' ? -1 : 1 }) // Prioritize same city

    res.json(nearbyDonors)
  } catch (error) {
    console.error('Get nearby donors error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router