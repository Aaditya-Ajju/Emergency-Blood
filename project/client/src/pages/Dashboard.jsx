import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FaTint, FaUser, FaHeart, FaMapMarkerAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalDonations: 0,
    activeRequests: 0,
    nearbyRequests: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, requestsResponse] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/recent-requests')
      ])
      
      setStats(statsResponse.data)
      setRecentRequests(requestsResponse.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high':
        return <FaExclamationTriangle className="text-red-500" />
      case 'medium':
        return <FaClock className="text-yellow-500" />
      case 'low':
        return <FaHeart className="text-green-500" />
      default:
        return <FaHeart className="text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'donor' 
              ? 'Thank you for being a life-saver. Here\'s your donation dashboard.'
              : 'Manage your blood requests and find donors in your area.'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTint className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaHeart className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {user?.role === 'donor' ? 'Donations Made' : 'Requests Fulfilled'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeRequests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaMapMarkerAlt className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nearby Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.nearbyRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === 'donor' ? 'Recent Blood Requests Near You' : 'Your Recent Requests'}
            </h2>
            <button className="btn-primary" onClick={() => navigate('/dashboard/requests')}>
              View All
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <FaTint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No recent requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-bold">{request.bloodGroup}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{request.patientName}</h3>
                        <p className="text-sm text-gray-500">{request.hospitalName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <FaMapMarkerAlt className="text-gray-400 text-sm" />
                          <span className="text-sm text-gray-600">{request.city}, {request.state}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{request.unitsNeeded} units needed</p>
                        <div className="flex items-center space-x-2">
                          {getUrgencyIcon(request.urgency)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => navigate(`/requests/${request._id}`)}>
                        {user?.role === 'donor' ? 'Respond' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {user?.role === 'donor' ? (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => navigate('/dashboard/requests')}>
                    <div className="flex items-center space-x-3">
                      <FaMapMarkerAlt className="text-primary-600" />
                      <span>Find Nearby Requests</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => navigate('/profile')}>
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-primary-600" />
                      <span>Update Availability</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => navigate('/blood-request')}>
                    <div className="flex items-center space-x-3">
                      <FaTint className="text-primary-600" />
                      <span>Create Blood Request</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => navigate('/find-donors')}>
                    <div className="flex items-center space-x-3">
                      <FaMapMarkerAlt className="text-primary-600" />
                      <span>Find Donors</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Group:</span>
                <span className="font-medium">{user?.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{user?.city}, {user?.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              {user?.role === 'donor' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className={`font-medium ${user?.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.isAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard