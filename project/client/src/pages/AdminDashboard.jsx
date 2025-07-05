import { useState, useEffect } from 'react'
import { FaUsers, FaTint, FaHospital, FaChartBar, FaExclamationTriangle } from 'react-icons/fa'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalReceivers: 0,
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    emergencyRequests: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsResponse, requestsResponse] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/recent-requests')
      ])
      
      setStats(statsResponse.data)
      setRecentRequests(requestsResponse.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage blood requests and monitor platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">
                  {stats.totalDonors} donors, {stats.totalReceivers} receivers
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTint className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
                <p className="text-sm text-gray-500">All time requests</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaHospital className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeRequests}</p>
                <p className="text-sm text-gray-500">Pending fulfillment</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Emergency Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.emergencyRequests}</p>
                <p className="text-sm text-gray-500">High priority</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Status Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Requests</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(stats.activeRequests / stats.totalRequests) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.activeRequests}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Requests</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.completedRequests / stats.totalRequests) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.completedRequests}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Emergency Requests</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(stats.emergencyRequests / stats.totalRequests) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.emergencyRequests}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Distribution</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Blood Donors</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(stats.totalDonors / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.totalDonors}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Blood Receivers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(stats.totalReceivers / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.totalReceivers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Blood Requests</h2>
            <button className="btn-primary" onClick={() => navigate('/admin/requests')}>View All Requests</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.patientName}</div>
                        <div className="text-sm text-gray-500">{request.hospitalName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">{request.bloodGroup}</span>
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{request.unitsNeeded} units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.city}, {request.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3" onClick={() => navigate(`/admin/requests/${request._id}`)}>
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => alert('Flag action coming soon!')}>
                        Flag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard