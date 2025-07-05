import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import bloodRequestsRoutes from './routes/bloodRequests.js';
import usersRoutes from './routes/users.js';
import donorsRoutes from './routes/donors.js';
import adminRoutes from './routes/admin.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Blood Request Platform API' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('MongoDB URI not provided, running without database');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many attempts, please try again later.'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', dashboardRoutes);
app.use('/api/blood-requests', bloodRequestsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/donors', donorsRoutes);
app.use('/api/admin', adminRoutes);