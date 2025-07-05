import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { FaTint, FaEye, FaEyeSlash } from 'react-icons/fa'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    const result = await registerUser(data)
    if (result.success) {
      navigate('/dashboard')
    }
    setIsLoading(false)
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <FaTint className="text-primary-600 text-5xl" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                type="text"
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[\d\s-()]{10,}$/,
                    message: 'Invalid phone number'
                  }
                })}
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Blood Group</label>
              <select
                {...register('bloodGroup', {
                  required: 'Blood group is required'
                })}
                className="form-input"
              >
                <option value="">Select your blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              {errors.bloodGroup && (
                <p className="mt-1 text-sm text-red-600">{errors.bloodGroup.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Age</label>
              <input
                {...register('age', {
                  required: 'Age is required',
                  min: {
                    value: 18,
                    message: 'Must be at least 18 years old'
                  },
                  max: {
                    value: 65,
                    message: 'Must be under 65 years old'
                  }
                })}
                type="number"
                className="form-input"
                placeholder="Enter your age"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Role</label>
              <select
                {...register('role', {
                  required: 'Role is required'
                })}
                className="form-input"
              >
                <option value="">Select your role</option>
                <option value="donor">Donor</option>
                <option value="receiver">Receiver</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                {...register('city', {
                  required: 'City is required'
                })}
                type="text"
                className="form-input"
                placeholder="Enter your city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">State</label>
              <input
                {...register('state', {
                  required: 'State is required'
                })}
                type="text"
                className="form-input"
                placeholder="Enter your state"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div className="relative">
              <label className="form-label">Password</label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                className="form-input pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => 
                    value === password || 'Passwords do not match'
                })}
                type="password"
                className="form-input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register