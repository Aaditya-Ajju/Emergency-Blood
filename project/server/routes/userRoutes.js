import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile, getDonations, getMe, getNearbyDonors } from '../controllers/userController.js';
import { getNotifications, markNotificationCompleted } from '../controllers/notificationController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get authenticated user's profile
router.get('/me', getMe);

// Get user's donation history
router.get('/donations', getDonations);

// Update user profile
router.patch('/profile', updateProfile);

// Get nearby available donors
router.get('/nearby-donors', getNearbyDonors);

// Notification routes
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/complete', markNotificationCompleted);

export default router; 