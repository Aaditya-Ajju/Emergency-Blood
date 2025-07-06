import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaUserCircle, FaTint, FaBars, FaTimes, FaBell, FaTimesCircle } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotifications(response.data)
      setUnreadCount(response.data.filter(n => !n.isRead).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
    navigate('/')
  }

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/notifications/${notification._id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // Open notification details in new tab
      window.open(`/notification/${notification._id}`, '_blank')
      
      // Refresh notifications
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FaTint className="text-primary-600 text-2xl" />
              <span className="text-xl font-bold text-gray-900">BloodConnect</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center ml-auto space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            {user?.role === 'receiver' && (
              <Link to="/find-donors" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Find Donor
              </Link>
            )}
            {user?.role === 'donor' && (
              <Link to="/find-requests" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Blood Requests
              </Link>
            )}
            <Link to="/emergency" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Emergency
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/blood-request" className="btn-primary text-sm">
                  Request Blood
                </Link>
                {notifications.length > 0 && (
                  <div className="relative">
                    <button
                      className="relative p-2 hover:bg-primary-100 rounded-md"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <FaBell className="text-2xl text-gray-700 hover:text-primary-600" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                          </div>
                          {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500">No notifications</div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto">
                              {notifications.map((notification) => (
                                <div
                                  key={notification._id}
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    !notification.isRead ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="relative group ml-2">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <FaUserCircle className="text-lg" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
              Home
            </Link>
            {user?.role === 'receiver' && (
              <Link to="/find-donors" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                Find Donor
              </Link>
            )}
            {user?.role === 'donor' && (
              <Link to="/find-requests" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                Blood Requests
              </Link>
            )}
            <Link to="/emergency" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
              Emergency
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/blood-request" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                  Request Blood
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar