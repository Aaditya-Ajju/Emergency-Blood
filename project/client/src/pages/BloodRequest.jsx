import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { FaTint, FaMapMarkerAlt, FaPhoneAlt, FaExclamationTriangle } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const BloodRequest = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await axios.post('/api/blood-requests', data)
      toast.success('Blood request submitted successfully!')
      reset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit blood request')
    } finally {
      setIsLoading(false)
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTint className="text-primary-600 mr-2" />
                  Patient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Patient Name *</label>
                    <input
                      {...register('patientName', { required: 'Patient name is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter patient's full name"
                    />
                    {errors.patientName && (
                      <p className="mt-1 text-sm text-red-600">{errors.patientName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Required Blood Group *</label>
                    <select
                      {...register('bloodGroup', { required: 'Blood group is required' })}
                      className="form-input"
                    >
                      <option value="">Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                    {errors.bloodGroup && (
                      <p className="mt-1 text-sm text-red-600">{errors.bloodGroup.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Units Needed *</label>
                    <input
                      {...register('unitsNeeded', { 
                        required: 'Units needed is required',
                        min: { value: 1, message: 'At least 1 unit is required' }
                      })}
                      type="number"
                      className="form-input"
                      placeholder="Number of units"
                    />
                    {errors.unitsNeeded && (
                      <p className="mt-1 text-sm text-red-600">{errors.unitsNeeded.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Urgency Level *</label>
                    <select
                      {...register('urgency', { required: 'Urgency level is required' })}
                      className="form-input"
                    >
                      <option value="">Select urgency</option>
                      {urgencyLevels.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    {errors.urgency && (
                      <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      {...register('notes')}
                      rows={3}
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
                    <label className="form-label">Hospital Name *</label>
                    <input
                      {...register('hospitalName', { required: 'Hospital name is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter hospital name"
                    />
                    {errors.hospitalName && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospitalName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Hospital Address *</label>
                    <input
                      {...register('hospitalAddress', { required: 'Hospital address is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter hospital address"
                    />
                    {errors.hospitalAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospitalAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">City *</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter city"
                      defaultValue={user?.city}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">State *</label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter state"
                      defaultValue={user?.state}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Pincode *</label>
                    <input
                      {...register('pincode', { required: 'Pincode is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter pincode"
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                    )}
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
                    <label className="form-label">Contact Person *</label>
                    <input
                      {...register('contactPerson', { required: 'Contact person is required' })}
                      type="text"
                      className="form-input"
                      placeholder="Enter contact person name"
                      defaultValue={user?.name}
                    />
                    {errors.contactPerson && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Contact Number *</label>
                    <input
                      {...register('contactNumber', { required: 'Contact number is required' })}
                      type="tel"
                      className="form-input"
                      placeholder="Enter contact number"
                      defaultValue={user?.phone}
                    />
                    {errors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
                    )}
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
                  onClick={() => reset()}
                  className="btn-secondary"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Request'
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