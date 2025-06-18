import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bloodRequestAPI, reviewAPI } from '../utils/api';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Droplet, AlertCircle, Loader2, ArrowLeft, Phone, User, Clock, CheckCircle, XCircle, Star, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Helper function for date formatting
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  };

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

  const handleMarkFulfilled = async () => {
    if (window.confirm('Are you sure you want to mark this request as fulfilled?')) {
      try {
        await bloodRequestAPI.update(request._id, { status: 'fulfilled' });
        toast.success('Request marked as fulfilled!');
        // Instead of re-fetching the entire request, update local state for faster UI response
        setRequest(prev => ({ ...prev, status: 'fulfilled' })); 
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark request as fulfilled');
      }
    }
  };

  const handleCancelRequest = async () => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await bloodRequestAPI.update(request._id, { status: 'cancelled' });
        toast.success('Request cancelled successfully!');
        // Instead of re-fetching the entire request, update local state for faster UI response
        setRequest(prev => ({ ...prev, status: 'cancelled' }));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel request');
      }
    }
  };

  const handleMarkCompleted = async () => {
    if (window.confirm('Are you sure you want to mark this request as completed?')) {
      try {
        await bloodRequestAPI.markAsCompleted(request._id);
        toast.success('Request marked as completed!');
        setRequest(prev => ({ ...prev, status: 'fulfilled' }));
        setShowFeedback(true);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark request as completed');
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsFeedbackLoading(true);
    if (rating === 0) {
      toast.error('Please give a star rating.');
      setIsFeedbackLoading(false);
      return;
    }
    try {
      // Find the first responder (for demo, you may want to let user pick)
      const responderId = request.responses && request.responses.length > 0 ? request.responses[0].donor._id : null;
      await reviewAPI.create({
        rating,
        comment,
        request: request._id,
        responder: responderId
      });
      toast.success('Feedback submitted successfully!');
      setShowFeedback(false);
      setRating(0);
      setComment('');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsFeedbackLoading(false);
    }
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

  // Robust check for requester
  const isRequester = user && request.requester && (
    user._id === request.requester._id ||
    user.id === request.requester._id ||
    user._id === request.requester.id ||
    user.id === request.requester.id
  );

  // Debug log
  console.log('user:', user, 'requester:', request.requester, 'isRequester:', isRequester);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
          return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)} // Go back to previous page (Dashboard or wherever they came from)
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white/40 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/30">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/50 pb-4">
              <h1 className="text-3xl font-bold text-gray-900">Blood Request for {request.patientName || 'N/A'}</h1>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)} bg-white/30 backdrop-filter backdrop-blur-sm`}>
                  {request.status && (request.status.charAt(0).toUpperCase() + request.status.slice(1))}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)} bg-white/30 backdrop-filter backdrop-blur-sm`}>
                  {request.urgency}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700 p-6 rounded-lg bg-white/30 backdrop-filter backdrop-blur-sm border border-white/50">
              <div className="flex items-center">
                <Droplet className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm">Blood Group:</p>
                  <p className="font-semibold text-lg">{request.bloodGroup || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm">Units Needed:</p>
                  <p className="font-semibold text-lg">{request.unitsNeeded || 'N/A'} units</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm">Location:</p>
                  <p className="font-semibold text-lg">{request.location?.address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm">Contact Number:</p>
                  <p className="font-semibold text-lg">{request.contact || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm">Requested By:</p>
                  <p className="font-semibold text-lg">{request.requester?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm">Requested On:</p>
                  <p className="font-semibold text-lg">{formatDisplayDate(request.createdAt)}</p>
                </div>
              </div>
              {request.requiredDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm">Required By:</p>
                    <p className="font-semibold text-lg">{formatShortDate(request.requiredDate)}</p>
                  </div>
                </div>
              )}
              {request.expiryDate && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm">Expires On:</p>
                    <p className="font-semibold text-lg">{formatDisplayDate(request.expiryDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {request.description && (
              <div className="mt-6 p-4 bg-white/50 rounded-lg border border-white/30">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700">{request.description}</p>
              </div>
            )}

            {/* Responses Section */}
            {request.responses && request.responses.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h3 className="text-lg font-bold text-blue-800 mb-2">Donor Responses</h3>
                <p className="text-blue-700">This request has received <span className="font-bold">{request.responses.length}</span> donor{request.responses.length !== 1 ? 's' : ''} response{request.responses.length !== 1 ? 's' : ''}.</p>
                {isRequester && (
                  <button 
                    onClick={() => navigate(`/requests/${id}/responses`)} // Assuming a page to view responses
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors bg-blue-500/70 backdrop-filter backdrop-blur-sm border-blue-600/50 hover:bg-blue-600/80"
                  >
                    View Responses
                  </button>
                )}
              </div>
            )}

            {/* Actions for Requester */}
            {isRequester && request.status === 'open' && request.responses && request.responses.length > 0 && !showFeedback && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleMarkCompleted}
                  className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5 mr-3" />
                  Mark as Completed
                </button>
                <button
                  onClick={handleCancelRequest}
                  className="mt-3 w-full inline-flex items-center justify-center px-6 py-3 border border-red-600 text-base font-medium rounded-xl shadow-sm text-red-600 bg-transparent hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  <XCircle className="w-5 h-5 mr-3" />
                  Cancel Request
                </button>
              </div>
            )}

            {/* Actions for Donors (if not requester and request is open) */}
            {user && request.requester && !isRequester && request.status === 'open' && (
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/requests/${id}/respond`)}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Respond to Request
                </button>
              </div>
            )}

            {/* Message if request is closed/fulfilled */}
            {request.status !== 'open' && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-800 text-center font-medium">
                This request is {request.status}.
              </div>
            )}

            {/* Feedback Form after completion */}
            {showFeedback && (
              <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Give Feedback</h3>
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2 text-center">Your Rating <span className="text-red-600">*</span></label>
                    <div className="flex justify-center space-x-1">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <Star
                            key={starValue}
                            className={`h-10 w-10 cursor-pointer transition-colors duration-200
                              ${starValue <= (hoverRating || rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-400'
                            }`}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-800 mb-1">Your Comments</label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                      placeholder="Share your experience or suggestions here..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isFeedbackLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-blue-700 hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      {isFeedbackLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Send className="h-5 w-5 mr-2" />
                      )}
                      {isFeedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                    </span>
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RequestDetails;