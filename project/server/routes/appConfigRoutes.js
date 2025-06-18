import express from 'express';
import { getAppFeatures, getAppStats } from '../controllers/appConfigController.js';

const router = express.Router();

// Public route to get application features
router.get('/features', getAppFeatures);

// Public route to get application statistics
router.get('/stats', getAppStats);

export default router; 