import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Clock, 
  AlertCircle,
  Calendar,
  Phone,
  Building,
  ArrowLeft,
  CheckCircle,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bloodRequestAPI } from '../utils/api';

const BloodRequestForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    urgency: 'normal',
    contact: '',
    location: {
      type: 'Point',
      coordinates: [0, 0], // Will be updated with actual coordinates
      address: ''
    },
    notes: '',
    units: 1,
    patientName: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-50' },
    { value: 'urgent', label: 'Urgent', color: 'text-orange-600 bg-orange-50' },
    { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.bloodGroup || !formData.contact || !formData.location.address || !formData.patientName) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      // Get current location coordinates
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const requestData = {
              ...formData,
              location: {
                ...formData.location,
                coordinates: [position.coords.longitude, position.coords.latitude]
              }
            };
            try {
              await bloodRequestAPI.create(requestData);
              toast.success('Blood request created successfully!');
              navigate('/dashboard');
            } catch (error) {
              console.error('Backend error:', error.response?.data || error);
              toast.error(error.response?.data?.message || 'Failed to create blood request (backend error)');
              setIsLoading(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Please enable location services to create a request (frontend error)');
            setIsLoading(false);
          }
        );
      } else {
        toast.error('Geolocation is not supported by your browser (frontend error)');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Frontend error:', error);
      toast.error('Unexpected error occurred (frontend error)');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 p-6 bg-white/40 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 drop-shadow-sm">
              Create Blood Request
            </h1>
            <p className="mt-2 text-base text-gray-700">
              Fill in the details below to create a new blood request. All fields marked with * are required.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/40 backdrop-filter backdrop-blur-lg shadow-xl rounded-2xl border border-white/30">
            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {/* Blood Type */}
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-800 mb-1">
                  Blood Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  required
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-full bg-white/70 text-gray-900 focus:bg-white transition-all duration-200"
                >
                  <option value="">Select blood type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Contact Information */}
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-800 mb-1">
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                    placeholder="e.g., +1234567890"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-800 mb-1">
                  Location Address <span className="text-red-600">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.location.address}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                    placeholder="e.g., Hospital XYZ, City, Country"
                  />
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-800 mb-1">
                  Patient Name <span className="text-red-600">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    required
                    value={formData.patientName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                    placeholder="e.g., John Doe"
                  />
                </div>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Urgency Level <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {urgencyLevels.map(level => (
                    <label
                      key={level.value}
                      htmlFor={`urgency-${level.value}`}
                      className={`flex items-center justify-center px-4 py-2 border rounded-full cursor-pointer text-sm font-medium transition-all duration-200
                        ${formData.urgency === level.value
                          ? 'bg-red-600 border-red-600 text-white shadow-lg'
                          : 'bg-white/70 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-800'
                        }`}
                    >
                      <input
                        type="radio"
                        id={`urgency-${level.value}`}
                        name="urgency"
                        value={level.value}
                        checked={formData.urgency === level.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="flex items-center">
                        {level.value === 'normal' && <Clock className="h-4 w-4 mr-2" />}
                        {level.value === 'urgent' && <AlertCircle className="h-4 w-4 mr-2" />}
                        {level.value === 'critical' && <Heart className="h-4 w-4 mr-2" />}
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Units of Blood */}
              <div>
                <label htmlFor="units" className="block text-sm font-medium text-gray-800 mb-1">
                  Units of Blood (Approx.)
                </label>
                <input
                  type="number"
                  id="units"
                  name="units"
                  min="1"
                  value={formData.units}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  placeholder="e.g., 1"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-800 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-red-700 hover:bg-red-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? 'Creating Request...' : 'Create Blood Request'}
                </span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BloodRequestForm; 