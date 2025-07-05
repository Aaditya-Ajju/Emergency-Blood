import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaUserCircle, FaTint, FaBars, FaTimes, FaBell, FaTimesCircle } from 'react-icons/fa'
import axios from 'axios'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      axios.get('/api/users/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setNotifications(res.data))
        .catch(() => setNotifications([]))
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    navigate('/')
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
            <Link to="/find-donors" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Find Donors
            </Link>
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
                <button
                  className="relative ml-6 focus:outline-none"
                  onClick={() => setShowNotifications(true)}
                  aria-label="Show notifications"
                >
                  <FaBell className="text-2xl text-gray-700 hover:text-primary-600" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
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

      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-primary-600 text-2xl"
              onClick={() => setShowNotifications(false)}
              aria-label="Close notifications"
            >
              <FaTimesCircle />
            </button>
            <div className="px-6 py-4 border-b font-semibold text-lg">Notifications</div>
            <div className="px-6 py-4">
              {notifications.length === 0 ? (
                <div className="text-gray-500">No notifications</div>
              ) : notifications.map((n, idx) => (
                <div
                  key={idx}
                  className={`mb-4 p-4 rounded cursor-pointer border ${n.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'} hover:bg-primary-50 transition`}
                  onClick={async () => {
                    if (!n.isRead) {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.patch(`/api/users/notifications/${n._id}/read`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
                      } catch {}
                    }
                    window.open(`/notification/${n._id}`, '_blank');
                    setShowNotifications(false);
                  }}
                >
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-gray-600">{n.message}</div>
                  {n.sender && (
                    <div className="mt-1 text-xs text-gray-700">
                      <b>Donor:</b> {n.sender.name} ({n.sender.bloodGroup})
                      {n.sender.phone && (
                        <>
                          <span className="ml-2">|</span>
                          <a href={`tel:${n.sender.phone}`} className="text-primary-600 ml-1 underline" onClick={e => e.stopPropagation()}>Contact</a>
                        </>
                      )}
                      {n.sender.city && (
                        <span className="ml-2">{n.sender.city}, {n.sender.state}</span>
                      )}
                    </div>
                  )}
                  {n.relatedRequest && (
                    <div className="mt-1 text-xs text-gray-500">
                      <b>Request:</b> {n.relatedRequest.patientName} ({n.relatedRequest.bloodGroup})
                      <span className="ml-2">{n.relatedRequest.hospitalName}, {n.relatedRequest.city}, {n.relatedRequest.state}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
              Home
            </Link>
            <Link to="/find-donors" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600">
              Find Donors
            </Link>
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