import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FaTint, FaMapMarkerAlt, FaPhoneAlt, FaExclamationTriangle } from 'react-icons/fa'

const BloodRequest = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsNeeded: '',
    hospitalName: '',
    hospitalAddress: '',
    city: '',
    state: '',
    pincode: '',
    requiredBy: '',
    urgency: 'medium',
    contactPerson: '',
    contactNumber: '',
    additionalInfo: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Fix date handling - ensure it's a valid date
      let requiredByDate;
      if (formData.requiredBy) {
        const date = new Date(formData.requiredBy);
        if (isNaN(date.getTime())) {
          toast.error('Please enter a valid date');
          setLoading(false);
          return;
        }
        requiredByDate = date.toISOString();
      } else {
        toast.error('Please select a required date');
        setLoading(false);
        return;
      }

      const data = {
        ...formData,
        unitsNeeded: parseInt(formData.unitsNeeded),
        requiredBy: requiredByDate
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/blood-requests`, data)
      toast.success('Blood request created successfully!')
      navigate('/dashboard')
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error(
          error.response.data.errors.map(e => e.msg).join(', ')
        );
      } else {
        toast.error(error.response?.data?.message || 'Failed to create blood request');
      }
    } finally {
      setLoading(false)
    }
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <FaTint className="text-primary-600 text-2xl" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">Request Blood</h1>
                <p className="text-primary-200">Submit a blood request and connect with donors</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTint className="text-primary-600 mr-2" />
                  Patient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="patientName" className="form-label">Patient Name *</label>
                    <input
                      type="text"
                      id="patientName"
                      name="patientName"
                      required
                      value={formData.patientName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="bloodGroup" className="form-label">Required Blood Group *</label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      required
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="unitsNeeded" className="form-label">Units Needed *</label>
                    <input
                      type="number"
                      id="unitsNeeded"
                      name="unitsNeeded"
                      required
                      min="1"
                      value={formData.unitsNeeded}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Number of units"
                    />
                  </div>

                  <div>
                    <label htmlFor="urgency" className="form-label">Urgency Level *</label>
                    <select
                      id="urgency"
                      name="urgency"
                      required
                      value={formData.urgency}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select urgency</option>
                      {urgencyLevels.map((level) => (
                        <option key={level.value} value={level.value} className={level.color}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="additionalInfo" className="form-label">Additional Notes</label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      rows="3"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Any additional information about the patient's condition..."
                    />
                  </div>
                </div>
              </div>

              {/* Hospital Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="text-primary-600 mr-2" />
                  Hospital Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="hospitalName" className="form-label">Hospital Name *</label>
                    <input
                      type="text"
                      id="hospitalName"
                      name="hospitalName"
                      required
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter hospital name"
                    />
                  </div>

                  <div>
                    <label htmlFor="requiredBy" className="form-label">Required By *</label>
                    <input
                      type="date"
                      id="requiredBy"
                      name="requiredBy"
                      required
                      value={formData.requiredBy}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="form-label">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="form-label">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label htmlFor="hospitalAddress" className="form-label">Hospital Address *</label>
                    <input
                      type="text"
                      id="hospitalAddress"
                      name="hospitalAddress"
                      required
                      value={formData.hospitalAddress}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter hospital address"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincode" className="form-label">Pincode *</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaPhoneAlt className="text-primary-600 mr-2" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactPerson" className="form-label">Contact Person *</label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      required
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-yellow-500 text-xl mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please ensure all information is accurate. For critical emergencies, 
                      contact your nearest hospital or emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Request...
                    </div>
                  ) : (
                    'Create Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BloodRequest