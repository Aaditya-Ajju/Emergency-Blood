import { useState, useEffect } from 'react'
import { FaTint, FaMapMarkerAlt, FaFilter, FaSearch, FaPhone, FaUser } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const FindDonors = () => {
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    bloodGroup: '',
    city: '',
    state: '',
    availability: 'all'
  })

  useEffect(() => {
    fetchDonors()
  }, [])

  useEffect(() => {
    filterDonors()
  }, [donors, filters])

  const fetchDonors = async () => {
    try {
      const response = await axios.get('/api/donors')
      setDonors(response.data.donors)
    } catch (error) {
      toast.error('Failed to fetch donors')
    } finally {
      setLoading(false)
    }
  }

  const filterDonors = () => {
    let filtered = donors

    if (filters.bloodGroup) {
      filtered = filtered.filter(donor => donor.bloodGroup === filters.bloodGroup)
    }

    if (filters.city) {
      filtered = filtered.filter(donor => 
        donor.city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }

    if (filters.state) {
      filtered = filtered.filter(donor => 
        donor.state.toLowerCase().includes(filters.state.toLowerCase())
      )
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter(donor => donor.isAvailable)
    } else if (filters.availability === 'not_available') {
      filtered = filtered.filter(donor => !donor.isAvailable)
    }

    setFilteredDonors(filtered)
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      city: '',
      state: '',
      availability: 'all'
    })
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Blood Donors</h1>
          <p className="text-gray-600">Connect with verified blood donors in your area</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaFilter className="text-primary-600 mr-2" />
              Filters
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Blood Group</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                className="form-input"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="form-input"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="form-input"
                placeholder="Enter state"
              />
            </div>

            <div>
              <label className="form-label">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="form-input"
              >
                <option value="all">All Donors</option>
                <option value="available">Available</option>
                <option value="not_available">Not Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredDonors.length} Donors Found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FaSearch />
              <span>Showing {filteredDonors.length} of {donors.length} donors</span>
            </div>
          </div>

          {filteredDonors.length === 0 ? (
            <div className="text-center py-12">
              <FaTint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Donors Found</h3>
              <p className="text-gray-500">Try adjusting your filters to find more donors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map((donor) => (
                <div key={donor._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {donor.profileImage ? (
                          <img 
                            src={donor.profileImage} 
                            alt={donor.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-primary-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{donor.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FaMapMarkerAlt />
                        <span>{donor.city}, {donor.state}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-sm">{donor.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Age:</span>
                      <span className="text-sm font-medium">{donor.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Availability:</span>
                      <span className={`text-sm font-medium ${donor.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {donor.isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Donation:</span>
                      <span className="text-sm font-medium">
                        {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                      <FaPhone className="text-sm" />
                      <span>Contact</span>
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      View Profile
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

export default FindDonors