import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { FaUser, FaTint, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCamera } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('phone', user.phone)
      setValue('bloodGroup', user.bloodGroup)
      setValue('age', user.age)
      setValue('city', user.city)
      setValue('state', user.state)
      setValue('isAvailable', user.isAvailable)
    }
  }, [user, setValue])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await axios.put('/api/users/profile', data)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {profileImage || user?.profileImage ? (
                    <img 
                      src={profileImage || user?.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-400 text-4xl" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                    <FaCamera className="text-sm" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-primary-200">{user?.role === 'donor' ? 'Blood Donor' : 'Blood Receiver'}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <FaTint className="text-primary-200" />
                    <span className="text-primary-200">{user?.bloodGroup}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaMapMarkerAlt className="text-primary-200" />
                    <span className="text-primary-200">{user?.city}, {user?.state}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="form-input"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      {...register('email', { required: 'Email is required' })}
                      type="email"
                      className="form-input"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      className="form-input"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Blood Group</label>
                    <select
                      {...register('bloodGroup', { required: 'Blood group is required' })}
                      className="form-input"
                    >
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Age</label>
                    <input
                      {...register('age', { required: 'Age is required' })}
                      type="number"
                      className="form-input"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">City</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      type="text"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">State</label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      type="text"
                      className="form-input"
                    />
                  </div>

                  {user?.role === 'donor' && (
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('isAvailable')}
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Available for donation</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-gray-400" />
                        <p className="text-lg text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-gray-400" />
                        <p className="text-lg text-gray-900">{user?.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Blood Group</label>
                      <div className="flex items-center space-x-2">
                        <FaTint className="text-red-500" />
                        <p className="text-lg text-gray-900">{user?.bloodGroup}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Age</label>
                      <p className="text-lg text-gray-900">{user?.age} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <p className="text-lg text-gray-900">{user?.city}, {user?.state}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {user?.role === 'donor' && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Donor Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Availability Status</label>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${user?.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <p className={`text-lg font-medium ${user?.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {user?.isAvailable ? 'Available' : 'Not Available'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Donation</label>
                        <p className="text-lg text-gray-900">
                          {user?.lastDonation ? new Date(user.lastDonation).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile