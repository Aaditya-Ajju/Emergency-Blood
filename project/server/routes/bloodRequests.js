import express from 'express';
import { body, param } from 'express-validator';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  respondToBloodRequest,
  fulfillBloodRequest,
  updateBloodRequestStatus,
  getMyBloodRequests,
  markAsCompleted
} from '../controllers/bloodRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const createBloodRequestValidation = [
  body('patientName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Patient name must be between 2 and 50 characters'),
  
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  
  body('units')
    .isInt({ min: 1, max: 10 })
    .withMessage('Units needed must be between 1 and 10'),
  
  body('urgency')
    .isIn(['normal', 'urgent', 'critical'])
    .withMessage('Please provide a valid urgency level'),
  
  body('location.address')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Location address is required'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  
  body('contact')
    .isMobilePhone()
    .withMessage('Please provide a valid contact number')
];

const fulfillBloodRequestValidation = [
  body('donorId')
    .isMongoId()
    .withMessage('Please provide a valid donor ID'),
  
  body('unitsProvided')
    .isInt({ min: 1, max: 10 })
    .withMessage('Units provided must be between 1 and 10')
];

// Routes
router.post('/', protect, createBloodRequestValidation, createBloodRequest);
router.get('/', getBloodRequests);
router.get('/my-requests', protect, getMyBloodRequests);
router.get('/:id', param('id').isMongoId(), getBloodRequestById);
router.post('/:id/respond', protect, param('id').isMongoId(), respondToBloodRequest);
router.post('/:id/fulfill', protect, param('id').isMongoId(), fulfillBloodRequestValidation, fulfillBloodRequest);
router.put('/:id/status', protect, param('id').isMongoId(), updateBloodRequestStatus);
router.post('/:id/complete', protect, param('id').isMongoId(), markAsCompleted);

export default router;