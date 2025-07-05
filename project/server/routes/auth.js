import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import crypto from 'crypto'

const router = express.Router()

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  body('age').isInt({ min: 18, max: 65 }).withMessage('Age must be between 18 and 65'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('role').optional().isIn(['donor', 'receiver']).withMessage('Role must be donor or receiver')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, phone, bloodGroup, age, city, state, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      bloodGroup,
      age,
      city,
      state,
      role: role || 'donor'
    })

    const token = generateToken(user._id)

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password')
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user.toJSON())
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body
    
    const user = await User.findById(req.user.id).select('+password')
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' })
    }
    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()
    // Simulate email by returning token in response (for now)
    res.json({ message: 'Password reset token generated', resetToken })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }
    const { token, password } = req.body
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    res.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router