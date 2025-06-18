import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      // Join user's room for notifications
      newSocket.emit('joinRoom', user.id);

      // Listen for new blood requests
      newSocket.on('newBloodRequest', (request) => {
        toast.success(`New blood request: ${request.bloodGroup} needed!`, {
          duration: 5000,
        });
      });

      // Listen for nearby blood requests
      newSocket.on('nearbyBloodRequest', ({ request, distance }) => {
        if (user.isDonor && user.isAvailable) {
          toast((t) => (
            <div className="flex flex-col space-y-2">
              <div className="font-semibold text-red-600">
                Emergency Blood Request Nearby!
              </div>
              <div className="text-sm text-gray-600">
                {request.bloodGroup} needed • {distance}km away
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    window.location.href = `/requests/${request._id}`;
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  View Request
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), {
            duration: 10000,
            position: 'top-right',
          });
        }
      });

      // Listen for responses to user's requests
      newSocket.on('newResponse', ({ requestId, response }) => {
        toast.success(`New response to your blood request from ${response.donor.name}!`);
        setNotifications((prev) => [
          {
            id: Date.now() + Math.random(),
            requestId,
            responder: response.donor,
            message: response.message,
            canDonate: response.canDonate,
            createdAt: response.createdAt,
            read: false
          },
          ...prev
        ]);
      });

      // Listen for donation confirmations
      newSocket.on('donationConfirmed', ({ request, newBadges }) => {
        toast.success(`Thank you for your donation! You saved a life! 🩸❤️`);
        
        // Show new badges if any
        if (newBadges && newBadges.length > 0) {
          const latestBadge = newBadges[newBadges.length - 1];
          toast.success(`🏆 New badge earned: ${latestBadge.name}!`, {
            duration: 6000,
          });
        }
      });

      // Listen for blood request updates
      newSocket.on('bloodRequestUpdated', (request) => {
        // Handle real-time updates to blood requests
        console.log('Blood request updated:', request);
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user]);

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    markAllNotificationsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};