import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTint, FaMapMarkerAlt, FaUser, FaPhone, FaCalendar, FaHospital } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blood-requests/${id}`);
      setRequest(res.data);
    } catch (error) {
      toast.error('Failed to fetch request details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    setResponding(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/blood-requests/${id}/respond`, { response });
      toast.success(`Request ${response === 'accepted' ? 'accepted' : 'declined'} successfully!`);
      fetchRequestDetails();
    } catch (error) {
      toast.error('Failed to respond to request');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Request Details</h1>
              <p className="text-gray-600">Request ID: {request._id}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Request Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-medium">{request.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaTint className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Group Required</p>
                      <p className="font-medium">{request.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaTint className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Units Needed</p>
                      <p className="font-medium">{request.unitsNeeded} units</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospital Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaHospital className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Hospital Name</p>
                      <p className="font-medium">{request.hospitalName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{request.city}, {request.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{request.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Phone</p>
                      <a href={`tel:${request.contactPhone}`} className="font-medium text-red-600 hover:text-red-700">
                        {request.contactPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Required By</p>
                      <p className="font-medium">{new Date(request.requiredBy).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Urgency Level</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {request.additionalInfo && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                  <p className="text-gray-700">{request.additionalInfo}</p>
                </div>
              )}

              {/* Donor Response Section */}
              {user?.role === 'donor' && request.status === 'pending' && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Respond to Request</h2>
                  <p className="text-gray-600 mb-4">
                    Can you help with this blood request? Please respond below.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleResponse('accepted')}
                      disabled={responding}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {responding ? 'Responding...' : 'Accept Request'}
                    </button>
                    <button
                      onClick={() => handleResponse('declined')}
                      disabled={responding}
                      className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {responding ? 'Responding...' : 'Decline Request'}
                    </button>
                  </div>
                </div>
              )}

              {/* Request Creator Actions */}
              {user?._id === request.createdBy && request.status === 'pending' && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Request</h2>
                  <p className="text-gray-600 mb-4">
                    You can edit or cancel this request if needed.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => navigate(`/requests/${id}/edit`)}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={() => handleResponse('cancelled')}
                      className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails; 