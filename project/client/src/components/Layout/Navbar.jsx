import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  MapPin, 
  Plus,
  Bell,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, markAllNotificationsRead } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: MapPin },
    { to: '/feedback', label: 'Feedback', icon: Heart },
    { to: '/create-request', label: 'Create Request', icon: Plus },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/homepage2" : "/"} className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart 
                className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform duration-200" 
                fill="currentColor"
              />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Heart 
                  className="w-8 h-8 text-red-300" 
                  fill="currentColor"
                />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Emergency<span className="text-red-600">Blood</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(to)
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 relative"
                    onClick={() => {
                      setShowNotifications((prev) => !prev);
                      if (!showNotifications) markAllNotificationsRead();
                    }}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications && notifications.some((n) => !n.read) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">Notifications</div>
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${n.read ? 'bg-white' : 'bg-red-50'}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-red-700">New Response</span>
                              <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="mt-1 text-gray-800">
                              <span className="font-semibold">{n.responder?.name}</span> responded:
                              <span className="ml-1 italic text-gray-600">"{n.message}"</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {n.responder?.bloodGroup && (<span>Blood Group: {n.responder.bloodGroup} | </span>)}
                              {n.responder?.phone && (<span>Phone: {n.responder.phone}</span>)}
                            </div>
                            <button
                              className="mt-2 text-xs text-blue-600 hover:underline"
                              onClick={() => {
                                navigate(`/requests/${n.requestId}`);
                                setShowNotifications(false);
                              }}
                            >
                              View Request
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-gray-500 text-center">No notifications yet.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        {user?.bloodGroup}
                        {user?.role === 'admin' && (
                          <Shield className="w-3 h-3 ml-1 text-blue-600" />
                        )}
                      </p>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-red-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-slide-up">
            <div className="space-y-2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(to)
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;