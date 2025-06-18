import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bloodRequestAPI } from '../utils/api';
import { motion } from 'framer-motion';
import { Heart, Droplet, MapPin, MessageCircle, Settings, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Homepage2 = () => {
  const { user } = useAuth();
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loadingUrgentRequests, setLoadingUrgentRequests] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUrgentBloodRequests();
    }
  }, [user]);

  const fetchUrgentBloodRequests = async () => {
    try {
      setLoadingUrgentRequests(true);
      const response = await bloodRequestAPI.getAll({ urgency: 'high', status: 'open' });
      setUrgentRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching urgent blood requests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch urgent requests.');
    } finally {
      setLoadingUrgentRequests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
            Welcome Back, <span className="text-red-600">{user?.name || 'Blood Hero'}</span>!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your dedication powers our mission to connect those in need with life-saving blood. Explore updates and quick actions below.
          </p>
        </div>

        {/* Quick Stats/Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {user?.isDonor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-red-50 p-6 rounded-xl shadow-md flex items-center space-x-4 border border-red-100"
            >
              <Droplet className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Last Donation</p>
                <p className="text-xl font-bold text-gray-900">
                  {user.lastDonation ? new Date(user.lastDonation).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 p-6 rounded-xl shadow-md flex items-center space-x-4 border border-blue-100"
          >
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Your Location</p>
              <p className="text-xl font-bold text-gray-900">
                {user?.location?.address || 'Not Set'}
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 p-6 rounded-xl shadow-md flex items-center space-x-4 border border-green-100"
          >
            <Heart className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Donation Count</p>
              <p className="text-xl font-bold text-gray-900">
                {user?.donationCount !== undefined ? user.donationCount : 'N/A'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Urgent Requests Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Urgent Blood Needs Nearby</h2>
        {loadingUrgentRequests ? (
          <div className="text-center text-gray-500">Loading urgent requests...</div>
        ) : urgentRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {urgentRequests.slice(0, 3).map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-md border border-red-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-xl font-semibold text-red-700 mb-1 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {request.bloodGroup} Blood Needed Urgently!
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {request.location?.address || 'Location not specified'}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/requests/${request._id}`}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 border border-gray-200 rounded-xl bg-gray-50">
            <p className="text-lg font-medium">No urgent blood requests at the moment. Keep saving lives!</p>
            <p className="text-sm mt-2">You can always <Link to="/dashboard" className="text-red-600 hover:underline">view all requests</Link> or <Link to="/create-request" className="text-red-600 hover:underline">create a new one</Link>.</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <Link to="/create-request" className="flex items-center justify-center py-4 px-6 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105">
            <Droplet className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Request Blood</span>
          </Link>
          <Link to="/dashboard" className="flex items-center justify-center py-4 px-6 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105">
            <MessageCircle className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">View All Requests</span>
          </Link>
          <Link to="/profile" className="flex items-center justify-center py-4 px-6 bg-gray-600 text-white rounded-xl shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
            <Settings className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Manage Profile</span>
          </Link>
          {user?.isDonor && (
            <Link to="/map" className="flex items-center justify-center py-4 px-6 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
              <MapPin className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">Find Nearby Requests</span>
            </Link>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default Homepage2; 