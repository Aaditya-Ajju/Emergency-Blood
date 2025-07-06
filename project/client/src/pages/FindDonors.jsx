import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FaTint, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const FindDonors = () => {
  const { user } = useAuth()
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'receiver') {
      fetchDonors()
    }
  }, [user])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (user.bloodGroup) params.append('bloodGroup', user.bloodGroup)
      if (user.city) params.append('city', user.city)
      params.append('isAvailable', 'true')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/donors?${params}`)
      setDonors(Array.isArray(response.data.donors) ? response.data.donors : response.data)
    } catch (error) {
      toast.error('Error fetching donors')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Donor</h1>
          <p className="text-gray-600">
            As a receiver, you can view and contact available blood donors in your area.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Donors</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (!Array.isArray(donors) || donors.length === 0) ? (
            <div className="text-center py-8">
              <FaUser className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No donors found matching your criteria.</p>
              <p className="text-sm text-gray-400">Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor) => (
                <div key={donor._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <FaTint className="text-red-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                        <p className="text-sm text-gray-600">{donor.bloodGroup}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      donor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {donor.isAvailable ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{donor.city}, {donor.state}</span>
                    </div>
                    {donor.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="mr-2" />
                        <a href={`tel:${donor.phone}`} className="text-red-600 hover:text-red-700">
                          {donor.phone}
                        </a>
                      </div>
                    )}
                    {donor.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaEnvelope className="mr-2" />
                        <a href={`mailto:${donor.email}`} className="text-red-600 hover:text-red-700">
                          {donor.email}
                        </a>
                      </div>
                    )}
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

export default FindDonors