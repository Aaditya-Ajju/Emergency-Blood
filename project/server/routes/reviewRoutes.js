import express from 'express';
import { createReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get all reviews
router.get('/', getReviews);

// Protected route to create a new review
router.post('/', protect, createReview);

export default router; 