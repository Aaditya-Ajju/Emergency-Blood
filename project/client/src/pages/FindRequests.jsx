import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { FaTint } from 'react-icons/fa'
import { toast } from 'react-toastify'

const FindRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'donor') {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (user.bloodGroup) params.append('bloodGroup', user.bloodGroup)
      if (user.city) params.append('city', user.city)
      params.append('status', 'active')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/blood-requests?${params}`)
      setRequests(Array.isArray(response.data.requests) ? response.data.requests : response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Error fetching requests')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id, response) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/blood-requests/${id}/respond`, { response })
      toast.success(`Request ${response === 'accepted' ? 'accepted' : 'declined'} successfully!`)
      fetchRequests()
    } catch (error) {
      console.error('Error responding to request:', error)
      const errorMessage = error.response?.data?.message || 'Failed to respond to request'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Requests</h1>
          <p className="text-gray-600">
            As a donor, you can view and respond to blood requests in your area.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Requests</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (!Array.isArray(requests) || requests.length === 0) ? (
            <div className="text-center py-8">
              <FaTint className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No requests found matching your criteria.</p>
              <p className="text-sm text-gray-400">Check back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.patientName} - {request.bloodGroup}</h3>
                      <p className="text-sm text-gray-600">{request.hospitalName}, {request.city}, {request.state}</p>
                      <p className="text-sm text-gray-500">Required by: {request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {request.status === 'active' ? 'Active' : request.status}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      onClick={() => handleRespond(request._id, 'accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                      onClick={() => handleRespond(request._id, 'declined')}
                    >
                      Decline
                    </button>
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

export default FindRequests 