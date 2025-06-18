import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import NotificationsDropdown from './NotificationsDropdown';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (user) {
      axios.get('/api/users/notifications')
        .then(res => setNotifications(res.data.notifications || []))
        .catch(() => setNotifications([]));
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on('newNotification', handleNewNotification);
    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkCompleted = (notifId) => {
    axios.patch(`/api/users/notifications/${notifId}/complete`).then(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId ? { ...n, isCompleted: true } : n
        )
      );
    });
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">🩸</span>
            <span className="text-xl font-semibold">EmergencyBlood</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="relative" onClick={() => setShowDropdown((s) => !s)}>
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {notifications.some((n) => !n.isCompleted) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {showDropdown && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onMarkCompleted={handleMarkCompleted}
                  />
                )}
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  to="/map"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
                >
                  Map
                </Link>
                <Link
                  to="/create-request"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
                >
                  Request Blood
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 