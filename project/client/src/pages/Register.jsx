import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Droplet,
  Eye, 
  EyeOff,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition, onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    phone: '',
    location: {
      coordinates: [],
      address: ''
    },
    isDonor: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState(null); // State for map marker position

  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    // Attempt to get current location initially
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const initialLatLng = { lat: latitude, lng: longitude };
          setPosition(initialLatLng);
          reverseGeocode(initialLatLng);
        },
        (err) => {
          console.warn(`ERROR(${err.code}): ${err.message}`);
          // Fallback to a default center if geolocation fails
          setPosition({ lat: 20.5937, lng: 78.9629 }); // Center of India
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, address: '' }
          }));
        }
      );
    } else {
      // Fallback to a default center if geolocation not supported
      setPosition({ lat: 20.5937, lng: 78.9629 }); // Center of India
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, address: '' }
      }));
    }
  }, []);

  const reverseGeocode = async (latlng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      if (response.data && response.data.display_name) {
        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: [latlng.lng, latlng.lat],
            address: response.data.display_name
          }
        }));
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      toast.error('Failed to get address from location.');
    }
  };

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    reverseGeocode(latlng);
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const forwardGeocode = async (address) => {
    if (!address) {
      setFormData(prev => ({ ...prev, location: { ...prev.location, coordinates: [] } }));
      setPosition(null);
      return;
    }
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPosition);
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, coordinates: [parseFloat(lon), parseFloat(lat)] }
        }));
      } else {
        console.warn('No coordinates found for address:', address);
        setFormData(prev => ({ ...prev, location: { ...prev.location, coordinates: [] } }));
        setPosition(null);
      }
    } catch (error) {
      console.error('Error during forward geocoding:', error);
    }
  };

  const debouncedForwardGeocode = debounce(forwardGeocode, 800);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'location.address') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, address: value }
      }));
      debouncedForwardGeocode(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Removed getCurrentLocation as its logic is now in useEffect and reverseGeocode
  const [locationLoading, setLocationLoading] = useState(false); // Kept for consistency if needed elsewhere

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.location.address) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location.coordinates || formData.location.coordinates.length !== 2) {
      newErrors.location = 'Please select a location on the map or enter a valid address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    try {
      const response = await axios.post('/api/auth/register', formData);
      if (response.data.success) {
        toast.success('Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart 
                className="w-16 h-16 text-red-600 animate-pulse-slow" 
                fill="currentColor"
              />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Heart 
                  className="w-16 h-16 text-red-300" 
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join EmergencyBlood
          </h2>
          <p className="text-gray-600">
            Create your account to start saving lives
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Account</span>
          </div>
          <div className={`w-8 h-1 ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'} rounded`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Profile</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="******"
                    required
                  />
                  <span 
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="******"
                    required
                  />
                  <span 
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Blood Group Field */}
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <Droplet className="w-4 h-4" />
                  </span>
                  <select
                    name="bloodGroup"
                    id="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  >
                    <option value="">Select your blood group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                {errors.bloodGroup && <p className="mt-2 text-sm text-red-600">{errors.bloodGroup}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="e.g., +91 9876543210"
                    required
                  />
                </div>
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Location Address Field */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Location Address</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Enter your full address"
                    required
                  />
                </div>
                {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* Map Component */}
              <div className="h-72 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={position || [20.5937, 78.9629]} // Center of India or current position
                  zoom={position ? 13 : 5} // Zoom in if location is set
                  style={{ height: '100%', width: '100%' }}
                  whenCreated={map => { map.invalidateSize(); if(position) map.setView(position, 13); }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker position={position} setPosition={setPosition} onMapClick={handleMapClick} />
                </MapContainer>
              </div>
              {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}

              {/* Donor Toggle */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                <label htmlFor="isDonor" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      id="isDonor"
                      name="isDonor"
                      className="sr-only"
                      checked={formData.isDonor}
                      onChange={handleChange}
                    />
                    <div className={`block ${formData.isDonor ? 'bg-red-600' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isDonor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Register as a blood donor</span>
                </label>
                <p className="text-xs text-gray-500 w-1/2">If enabled, your profile will be visible to others for blood requests.</p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 mr-2 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 ml-2 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Register
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account? {' '}
          <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;