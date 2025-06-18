import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bloodRequestAPI } from '../utils/api';
import { userAPI } from '../utils/api';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bloodRequests, setBloodRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    nearbyDonors: 0
  });

  useEffect(() => {
    if (user) {
      fetchBloodRequests(selectedStatus, searchQuery);
      fetchNearbyDonorsCount();
    }
  }, [user, selectedStatus, searchQuery]);

  const fetchNearbyDonorsCount = async () => {
    try {
      if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
        console.warn('User location not available for fetching nearby donors.');
        setStats(prevStats => ({ ...prevStats, nearbyDonors: 0 }));
        return;
      }

      const [longitude, latitude] = user.location.coordinates;
      const radius = 5000; // Default radius of 5 km (5000 meters)

      const response = await userAPI.getNearbyDonors(latitude, longitude, radius);
      setStats(prevStats => ({ ...prevStats, nearbyDonors: response.data.count }));
    } catch (error) {
      console.error('Error fetching nearby donors count:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch nearby donors count');
    }
  };

  const fetchBloodRequests = async (statusFilter, search) => {
    try {
      setIsLoading(true);

      // 1. Fetch ALL requests for accurate stats calculation
      const allRequestsResponse = await bloodRequestAPI.getAll();
      console.log('All requests API Response:', allRequestsResponse);
      const allRequests = Array.isArray(allRequestsResponse.data.data) ? allRequestsResponse.data.data : [];
      
      const total = allRequests.length;
      const active = allRequests.filter(req => req.status === 'open').length;
      const completed = allRequests.filter(req => req.status === 'fulfilled').length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalRequests: total,
        activeRequests: active,
        completedRequests: completed,
      }));

      // 2. Fetch FILTERED requests for display
      const params = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search // Pass search query to API
      };
      const filteredRequestsResponse = await bloodRequestAPI.getAll(params);
      console.log('Filtered requests API Response:', filteredRequestsResponse);
      const requestsToDisplay = Array.isArray(filteredRequestsResponse.data.data) ? filteredRequestsResponse.data.data : [];
      setBloodRequests(requestsToDisplay);
      
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch blood requests');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequestsByStatus = (status) => {
    setSelectedStatus(status);
  };

  const displayedRequests = bloodRequests;

  // Split requests into active and completed
  const activeRequests = bloodRequests.filter(req => req.status === 'open');
  const completedRequests = bloodRequests.filter(req => req.status === 'fulfilled');

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Link
              to="/create-request"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-red-700 hover:bg-red-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                New Blood Request
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3 shadow-md">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Total Requests</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.totalRequests}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <button
                onClick={() => filterRequestsByStatus('all')}
                className="font-medium text-red-600 hover:text-red-800 transition-colors flex items-center"
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3 shadow-md">
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Active Requests</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.activeRequests}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <button
                onClick={() => filterRequestsByStatus('open')}
                className="font-medium text-red-600 hover:text-red-800 transition-colors flex items-center"
              >
                View active
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3 shadow-md">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Completed</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.completedRequests}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <button
                onClick={() => filterRequestsByStatus('fulfilled')}
                className="font-medium text-red-600 hover:text-red-800 transition-colors flex items-center"
              >
                View completed
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3 shadow-md">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Nearby Donors</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.nearbyDonors}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <Link
                to="/map"
                className="font-medium text-red-600 hover:text-red-800 transition-colors flex items-center"
              >
                View donors
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8 p-6 bg-white/40 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 flex items-center space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by blood type, hospital, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => filterRequestsByStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-full bg-white/70 text-gray-900 focus:bg-white transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronRight className="h-5 w-5 text-gray-500 rotate-90" />
              </div>
            </div>
            <button
              onClick={() => fetchBloodRequests(selectedStatus, searchQuery)}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>

          {/* Active Requests Section */}
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Active Requests</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-600">Loading blood requests...</div>
            ) : activeRequests.length > 0 ? (
              activeRequests.map(request => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/requests/${request._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-100 rounded-full p-3 shadow-md">
                        <Heart className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xl font-bold text-gray-900">{request.bloodGroup} Blood Required</p>
                        <p className="text-sm text-gray-700 mt-1 flex items-center"><MapPin className="h-4 w-4 mr-1" /> {request.hospitalName || 'N/A'}</p>
                        {request.contactNumber && (
                          <p className="text-sm text-gray-700 mt-1 flex items-center"><Phone className="h-4 w-4 mr-1" /> {request.contactNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                      <ChevronRight className="h-6 w-6 text-gray-600 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-600 p-8 rounded-lg bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 shadow-xl">
                <p className="text-lg font-semibold">No active blood requests found.</p>
              </div>
            )}
          </div>
          {/* Completed Requests Section */}
          <h2 className="text-2xl font-bold text-blue-800 mt-12 mb-4">Completed Requests</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-600">Loading completed requests...</div>
            ) : completedRequests.length > 0 ? (
              completedRequests.map(request => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative p-6 rounded-2xl shadow-xl bg-blue-50/40 backdrop-filter backdrop-blur-lg border border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/requests/${request._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-3 shadow-md">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xl font-bold text-gray-900">{request.bloodGroup} Blood Request Completed</p>
                        <p className="text-sm text-gray-700 mt-1 flex items-center"><MapPin className="h-4 w-4 mr-1" /> {request.hospitalName || 'N/A'}</p>
                        {request.contactNumber && (
                          <p className="text-sm text-gray-700 mt-1 flex items-center"><Phone className="h-4 w-4 mr-1" /> {request.contactNumber}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Requester: {request.requester?.name || 'Unknown'} | Completed: {request.fulfilledAt ? new Date(request.fulfilledAt).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                      <ChevronRight className="h-6 w-6 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-600 p-8 rounded-lg bg-blue-50/40 backdrop-filter backdrop-blur-lg border border-blue-100 shadow-xl">
                <p className="text-lg font-semibold">No completed requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;