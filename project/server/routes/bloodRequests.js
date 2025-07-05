import express from 'express'
import { body, validationResult } from 'express-validator'
import BloodRequest from '../models/BloodRequest.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// @desc    Create blood request
// @route   POST /api/blood-requests
// @access  Private
router.post('/', protect, [
  body('patientName').trim().isLength({ min: 2 }).withMessage('Patient name is required'),
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  body('unitsNeeded').isInt({ min: 1 }).withMessage('Units needed must be at least 1'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Valid urgency level is required'),
  body('hospitalName').trim().isLength({ min: 2 }).withMessage('Hospital name is required'),
  body('hospitalAddress').trim().isLength({ min: 5 }).withMessage('Hospital address is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('pincode').trim().isLength({ min: 5 }).withMessage('Valid pincode is required'),
  body('contactPerson').trim().isLength({ min: 2 }).withMessage('Contact person is required'),
  body('contactNumber').isMobilePhone().withMessage('Valid contact number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const bloodRequest = await BloodRequest.create({
      ...req.body,
      requestedBy: req.user.id
    })

    await bloodRequest.populate('requestedBy', 'name email phone')

    res.status(201).json({
      message: 'Blood request created successfully',
      request: bloodRequest
    })
  } catch (error) {
    console.error('Create blood request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get all blood requests
// @route   GET /api/blood-requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      bloodGroup,
      city,
      state,
      urgency,
      status,
      page = 1,
      limit = 20
    } = req.query

    const filter = {}

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup
    }

    if (city) {
      filter.city = new RegExp(city, 'i')
    }

    if (state) {
      filter.state = new RegExp(state, 'i')
    }

    if (urgency) {
      filter.urgency = urgency
    }

    if (status) {
      filter.status = status
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
    console.error('Get blood requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get user's blood requests
// @route   GET /api/blood-requests/my-requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.id })
      .populate('requestedBy', 'name email phone')
      .populate('donors.donor', 'name phone bloodGroup city state')
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    console.error('Get my requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Get blood request by ID
// @route   GET /api/blood-requests/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('donors.donor', 'name phone bloodGroup city state')

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    res.json(request)
  } catch (error) {
    console.error('Get blood request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Update blood request
// @route   PUT /api/blood-requests/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    // Check if user owns the request
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' })
    }

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('requestedBy', 'name email phone')

    res.json({
      message: 'Blood request updated successfully',
      request: updatedRequest
    })
  } catch (error) {
    console.error('Update blood request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Delete blood request
// @route   DELETE /api/blood-requests/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    // Check if user owns the request
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this request' })
    }

    await BloodRequest.findByIdAndDelete(req.params.id)

    res.json({ message: 'Blood request deleted successfully' })
  } catch (error) {
    console.error('Delete blood request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Respond to blood request (donor)
// @route   POST /api/blood-requests/:id/respond
// @access  Private
router.post('/:id/respond', protect, [
  body('response').isIn(['accepted', 'rejected']).withMessage('Valid response is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { response } = req.body

    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can respond to requests' })
    }

    const request = await BloodRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    // Check if donor already responded
    const existingResponse = request.donors.find(
      donor => donor.donor.toString() === req.user.id
    )

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already responded to this request' })
    }

    // Add donor response
    request.donors.push({
      donor: req.user.id,
      status: response,
      responseDate: new Date()
    })

    await request.save()

    // Create notification for receiver
    await Notification.create({
      recipient: request.requestedBy,
      sender: req.user.id,
      type: 'donor_response',
      title: 'New Donor Response',
      message: `${req.user.name} has responded to your blood request!`,
      relatedRequest: request._id,
      priority: request.urgency === 'high' ? 'high' : 'medium'
    });

    res.json({
      message: `Response ${response} recorded successfully`,
      request
    })
  } catch (error) {
    console.error('Respond to request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Mark donation as completed
// @route   PUT /api/blood-requests/:id/complete
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' })
    }

    // Check if user owns the request
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to complete this request' })
    }

    request.status = 'completed'
    request.completedDate = new Date()

    await request.save()

    res.json({
      message: 'Blood request marked as completed',
      request
    })
  } catch (error) {
    console.error('Complete request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router