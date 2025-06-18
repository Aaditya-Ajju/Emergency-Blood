import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bloodRequestAPI } from '../utils/api';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Droplet, AlertCircle, Loader2, ArrowLeft, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RespondToRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
  });

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await bloodRequestAPI.getById(id);
        setRequest(response.data.data || response.data.request);
      } catch (error) {
        toast.error('Failed to fetch request details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await bloodRequestAPI.respond(id, formData);
      toast.success('Response sent to requester!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit response error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Request Not Found</h2>
          <p className="text-gray-600 mt-2">The blood request you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => navigate(`/requests/${id}`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Request Details
        </button>

        <div className="bg-white/40 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/30">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Respond to Blood Request</h1>

            <div className="mb-8 p-6 bg-white/30 rounded-lg border border-white/50">
              <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-white/50 pb-3">Request Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <div className="flex items-center mb-3">
                    <Droplet className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium">Blood Group:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{request.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium">Units Needed:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{request.unitsNeeded || 'N/A'} units</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="font-medium">Patient Name:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{request.patientName || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{request.location?.address || 'N/A'}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="font-medium">Requested On:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{formatDisplayDate(request.createdAt)}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Requested By:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{request.requester?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-2">
                  Your Message (e.g., your name, availability, or any notes)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white/70 backdrop-filter backdrop-blur-sm placeholder-gray-500 text-gray-900 transition-all duration-200"
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Response'
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RespondToRequest; 