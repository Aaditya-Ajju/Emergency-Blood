import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, bloodGroup, phone, location, isDonor, firebaseUid } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        ...(firebaseUid ? [{ firebaseUid }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists'
          : 'User with this Firebase ID already exists'
      });
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      bloodGroup,
      phone,
      location,
      isDonor: isDonor || true
    };
    if (firebaseUid && typeof firebaseUid === 'string' && firebaseUid.trim() !== '') {
      userData.firebaseUid = firebaseUid;
    }
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        location: user.location,
        isDonor: user.isDonor,
        isAvailable: user.isAvailable,
        donationCount: user.donationCount,
        badges: user.badges,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt with data:', { ...req.body, password: '[REDACTED]' });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array();
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors.map(err => ({
          field: err.param,
          message: err.msg,
          value: err.value
        }))
      });
    }

    const { email, password, firebaseUid } = req.body;

    // Find user by email or firebaseUid
    const user = await User.findOne(
      firebaseUid ? { firebaseUid } : { email }
    ).select('+password');

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If using email/password login, verify password
    if (!firebaseUid) {
      if (!password) {
        console.log('Password missing in request');
        return res.status(400).json({
          success: false,
          message: 'Password is required for email login'
        });
      }
      
      if (!user.password) {
        console.error('User found but password is missing:', user._id);
        return res.status(500).json({
          success: false,
          message: 'Account error - please contact support'
        });
      }

      try {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          console.log('Password mismatch for user:', user._id);
          return res.status(400).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      } catch (error) {
        console.error('Password comparison error:', error);
        return res.status(500).json({
          success: false,
          message: 'Error during login',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful for user:', user._id);

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      bloodGroup: user.bloodGroup,
      phone: user.phone,
      location: user.location,
      isDonor: user.isDonor,
      isAvailable: user.isAvailable,
      donationCount: user.donationCount,
      badges: user.badges,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        location: user.location,
        isDonor: user.isDonor,
        isAvailable: user.isAvailable,
        donationCount: user.donationCount,
        badges: user.badges,
        role: user.role,
        lastDonation: user.lastDonation
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'phone', 'location', 'isDonor', 'isAvailable'];
    const filteredUpdates = {};

    // Filter only allowed updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        location: user.location,
        isDonor: user.isDonor,
        isAvailable: user.isAvailable,
        donationCount: user.donationCount,
        badges: user.badges,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};