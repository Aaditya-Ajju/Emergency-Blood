import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { FaTint, FaMapMarkerAlt, FaPhone, FaUser, FaCalendar } from 'react-icons/fa'

const NotificationDetails = () => {
  const { id } = useParams()
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/notifications/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setNotification(res.data)
      } catch (error) {
        console.error('Error fetching notification:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notification Not Found</h2>
          <Link
            to="/dashboard"
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Details</h1>
              <p className="text-gray-600">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="space-y-6">
            {/* Notification Content */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{notification.title}</h2>
              <p className="text-gray-700 mb-4">{notification.message}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FaCalendar />
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Donor Information */}
            {notification.sender && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{notification.sender.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaTint className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-medium">{notification.sender.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {notification.sender.city}, {notification.sender.state}
                      </p>
                    </div>
                  </div>
                  {notification.sender.phone && (
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a
                          href={`tel:${notification.sender.phone}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {notification.sender.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blood Request Information */}
            {notification.relatedRequest && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Request Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-medium">{notification.relatedRequest.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaTint className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Group Required</p>
                      <p className="font-medium">{notification.relatedRequest.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Hospital</p>
                      <p className="font-medium">
                        {notification.relatedRequest.hospitalName}, {notification.relatedRequest.city}, {notification.relatedRequest.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Required By</p>
                      <p className="font-medium">
                        {new Date(notification.relatedRequest.requiredBy).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {notification.sender?.phone && (
                <a
                  href={`tel:${notification.sender.phone}`}
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Call Donor
                </a>
              )}
              {notification.sender?.email && (
                <a
                  href={`mailto:${notification.sender.email}`}
                  className="flex-1 bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Email Donor
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationDetails 