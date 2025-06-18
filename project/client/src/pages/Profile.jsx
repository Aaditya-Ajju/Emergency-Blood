import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { authAPI } from '../utils/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Pencil, 
  Save, 
  XCircle, 
  MapPin, 
  Phone, 
  User as UserIcon,
  CheckCircle, 
  XOctagon
} from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: {
      coordinates: [],
      address: ''
    },
    isAvailable: false,
    isDonor: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: {
          coordinates: user.location?.coordinates || [],
          address: user.location?.address || ''
        },
        isAvailable: user.isAvailable,
        isDonor: user.isDonor,
      });
    }
    fetchDonationHistory();
  }, [user]);

  // Debounce function to limit API calls
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
      return;
    }
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, coordinates: [parseFloat(lon), parseFloat(lat)] }
        }));
      } else {
        console.warn('No coordinates found for address:', address);
        setFormData(prev => ({ ...prev, location: { ...prev.location, coordinates: [] } }));
      }
    } catch (error) {
      console.error('Error during forward geocoding:', error);
      toast.error('Failed to find location for address.');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use formData.location which now correctly has coordinates and address
      const updatedUser = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location, // Send the entire location object
        isAvailable: formData.isAvailable,
        isDonor: formData.isDonor,
      });
      setUser(updatedUser.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const fetchDonationHistory = async () => {
    try {
      const response = await api.get('/user/donations');
      setDonationHistory(response.data.donations);
    } catch (error) {
      setError('Failed to fetch donation history');
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badgeName) => {
    const colors = {
      'First Drop': 'bg-blue-100 text-blue-800',
      'Life Saver': 'bg-green-100 text-green-800',
      'Blood Hero': 'bg-purple-100 text-purple-800',
      'Guardian Angel': 'bg-yellow-100 text-yellow-800',
      'Legend': 'bg-red-100 text-red-800'
    };
    return colors[badgeName] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/60 hover:bg-white/80 transition-colors shadow-md"
              title="Edit Profile"
            >
              <Pencil className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl">🩸</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 drop-shadow-sm">{user.name}</h1>
              <p className="text-gray-700">{user.email}</p>
              <p className="text-gray-700">Blood Group: {user.bloodGroup}</p>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-8 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 drop-shadow-sm">Edit Profile</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-1">Phone</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-800 mb-1">Address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="location.address"
                  id="address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/70 backdrop-filter backdrop-blur-sm p-3 rounded-full shadow-inner border border-white/40">
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="focus:ring-red-500 h-5 w-5 text-red-600 border-gray-300 rounded-full bg-white/80 transition-colors cursor-pointer"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-base text-gray-900 font-medium cursor-pointer">
                Available to Donate
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 bg-white/70 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-red-700 hover:bg-red-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* User Info & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm">My Information</h2>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center"><Phone className="h-5 w-5 mr-2 text-gray-600" /> {user.phone}</p>
                  <p className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-gray-600" /> {user.location?.address}</p>
                  <p className={`flex items-center font-medium ${user.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${user.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {user.isAvailable ? 'Available to Donate' : 'Not Available to Donate'}
                  </p>
                  <p className={`flex items-center font-medium ${user.isDonor ? 'text-red-700' : 'text-gray-700'}`}>
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${user.isDonor ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                    {user.isDonor ? 'Registered as Donor' : 'Not Registered as Donor'}
                  </p>
                </div>
              </div>

              {/* Donation Count & Badges */}
              <div className="p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm">Donation Stats</h2>
                <p className="text-4xl font-bold text-red-600">{user.donationCount || 0}</p>
                <p className="text-lg text-gray-700">Total Donations Made</p>
                
                <h3 className="text-lg font-bold text-gray-900 mt-6">Badges</h3>
                {user.badges && user.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(badge.name)}`}>
                        {badge.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm">No badges earned yet. Keep donating!</p>
                )}
              </div>
            </div>

            {/* Donation History */}
            <div className="p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm mb-4">Donation History</h2>
              {donationHistory.length > 0 ? (
                <div className="space-y-4">
                  {donationHistory.map(donation => (
                    <div key={donation._id} className="p-4 bg-white/70 rounded-lg shadow-sm border border-white/40 flex items-center justify-between transition-all duration-200 hover:shadow-md">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{donation.bloodGroup} donated to {donation.requester?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-700">on {new Date(donation.fulfilledAt[0]?.fulfilledAt || donation.updatedAt).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700">Units: {donation.fulfilledBy[0]?.unitsProvided || 1}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-700">
                  <XOctagon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No donation history found.</p>
                  <p className="text-sm">Make your first donation to see it here!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile; 