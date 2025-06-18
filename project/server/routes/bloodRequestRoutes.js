import express from 'express';
import {
  createRequest,
  getBloodRequests,
  getRequest,
  updateRequest,
  fulfillRequest
} from '../controllers/bloodRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create a new blood request
router.post('/', createRequest);

// Get all blood requests (with filters)
router.get('/', getBloodRequests);

// Get a single blood request
router.get('/:id', getRequest);

// Update a blood request
router.patch('/:id', updateRequest);

// Fulfill a blood request
router.post('/:id/fulfill', fulfillRequest);

export default router; 