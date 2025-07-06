import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { FaTint, FaUsers, FaMapMarkerAlt, FaChartLine, FaPlus, FaEye } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    successRate: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let statsRes, requestsRes
        if (user?.role === 'donor') {
          // Donor: show accepted requests
          statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`)
          requestsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-requests`)
        } else {
          // Receiver: show own requests
          statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`)
          requestsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-requests`)
        }
        setStats(statsRes.data)
        setRecentRequests(requestsRes.data.requests || requestsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user])

  const handleMarkCompleted = async (requestId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/blood-requests/${requestId}/complete`)
      toast.success('Request marked as completed!')
      // Refresh dashboard data
      setLoading(true)
      const [statsRes, requestsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-requests`)
      ])
      setStats(statsRes.data)
      setRecentRequests(requestsRes.data)
      setLoading(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as completed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your blood donation activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaTint className="text-red-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaUsers className="text-yellow-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'donor' ? 'Accepted' : 'Pending'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user?.role === 'donor' ? stats.acceptedRequests : stats.pendingRequests}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaChartLine className="text-green-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'donor' ? 'Completed' : 'Completed'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user?.role === 'donor' ? stats.completedDonations : stats.completedRequests}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaTint className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'donor' ? 'Donations' : 'Success Rate'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user?.role === 'donor' ? stats.totalDonations : `${stats.successRate || 0}%`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user?.role === 'receiver' && (
              <>
                <Link
                  to="/blood-request"
                  className="flex items-center justify-center p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <FaPlus className="text-red-600 mr-2" />
                  <span className="text-red-600 font-medium">New Blood Request</span>
                </Link>
                <Link
                  to="/find-donors"
                  className="flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <FaUsers className="text-blue-600 mr-2" />
                  <span className="text-blue-600 font-medium">Find Donors</span>
                </Link>
              </>
            )}
            {user?.role === 'donor' && (
              <Link
                to="/find-requests"
                className="flex items-center justify-center p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
              >
                <FaTint className="text-red-600 mr-2" />
                <span className="text-red-600 font-medium">Blood Requests</span>
              </Link>
            )}
            <Link
              to="/emergency"
              className="flex items-center justify-center p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
            >
              <FaTint className="text-orange-600 mr-2" />
              <span className="text-orange-600 font-medium">Emergency Request</span>
            </Link>
          </div>
        </div>

        {/* Recent Requests / Accepted Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === 'donor' ? 'Accepted Requests' : 'Recent Requests'}
            </h2>
            {user?.role === 'receiver' && (
              <Link
                to="/blood-request"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                View All
              </Link>
            )}
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <FaTint className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No requests found.</p>
              {user?.role === 'receiver' && (
                <Link
                  to="/blood-request"
                  className="mt-4 inline-block text-red-600 hover:text-red-700 font-medium"
                >
                  Create your first request
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {request.patientName} - {request.bloodGroup}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.hospitalName}, {request.city}, {request.state}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Required by: {request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'active' ? 'Active' : request.status}
                      </span>
                      <Link
                        to={`/requests/${request._id}`}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaEye className="text-lg" />
                      </Link>
                      {/* Mark as Completed button for pending requests owned by user */}
                      {user?.role === 'receiver' && request.status === 'active' && request.requestedBy._id === user._id && (
                        <button
                          className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                          onClick={() => handleMarkCompleted(request._id)}
                          disabled={loading}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard