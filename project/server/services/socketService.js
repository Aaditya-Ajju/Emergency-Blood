import { Server } from 'socket.io';
import User from '../models/User.js';
import { calculateDistance } from '../utils/geoUtils.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Store user's socket ID
    socket.on('register', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { socketId: socket.id });
        console.log('User registered:', userId);
      } catch (error) {
        console.error('Socket registration error:', error);
      }
    });

    // Join user-specific room for notifications
    socket.on('joinRoom', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
        console.log('User disconnected:', socket.id);
      } catch (error) {
        console.error('Socket disconnection error:', error);
      }
    });

    // Handle location updates
    socket.on('updateLocation', (data) => {
      socket.userLocation = data.location;
    });
  });

  return io;
};

export const notifyNearbyDonors = async (bloodRequest, donors) => {
  if (!io) return;

  const nearbyDonors = donors.filter(donor => {
    if (!donor.location || !bloodRequest.location) return false;
    
    const distance = calculateDistance(
      donor.location.coordinates,
      bloodRequest.location.coordinates
    );
    
    return distance <= 50; // Notify donors within 50km radius
  });

  nearbyDonors.forEach(donor => {
    io.to(donor.socketId).emit('newBloodRequest', {
      request: bloodRequest,
      distance: calculateDistance(
        donor.location.coordinates,
        bloodRequest.location.coordinates
      )
    });
  });
};

export const notifyRequestFulfilled = async (bloodRequest) => {
  try {
    if (bloodRequest.requester.socketId) {
      io.to(bloodRequest.requester.socketId).emit('requestFulfilled', {
        request: bloodRequest
      });
    }
  } catch (error) {
    console.error('Error notifying requester:', error);
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 