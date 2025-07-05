import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTint, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await axios.get(`/api/blood-requests/${id}`);
        setRequest(res.data);
      } catch (error) {
        toast.error('Failed to fetch request details');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleRespond = async () => {
    setResponding(true);
    try {
      await axios.post(`/api/blood-requests/${id}/respond`, { response: 'accepted' });
      toast.success('You have responded to this request!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>;
  }
  if (!request) {
    return <div className="min-h-screen flex items-center justify-center">Request not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center"><FaTint className="text-primary-600 mr-2" /> Blood Request Details</h1>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FaUser className="text-gray-500 mr-2" />
            <span className="font-medium">Patient:</span> {request.patientName}
          </div>
          <div className="flex items-center mb-2">
            <FaTint className="text-red-500 mr-2" />
            <span className="font-medium">Blood Group:</span> {request.bloodGroup}
          </div>
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-blue-500 mr-2" />
            <span className="font-medium">Location:</span> {request.city}, {request.state}
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium">Units Needed:</span> {request.unitsNeeded}
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium">Urgency:</span> {request.urgency}
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium">Hospital:</span> {request.hospitalName} ({request.hospitalAddress})
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium">Pincode:</span> {request.pincode}
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium">Notes:</span> {request.notes || 'N/A'}
          </div>
          <div className="flex items-center mb-2">
            <FaPhone className="text-green-500 mr-2" />
            <span className="font-medium">Contact:</span> {request.requestedBy?.name} ({request.requestedBy?.phone})
          </div>
        </div>
        {user?.role === 'donor' && (
          <button
            className="btn-primary w-full mt-4"
            onClick={handleRespond}
            disabled={responding}
          >
            {responding ? 'Responding...' : 'Respond'}
          </button>
        )}
        <button className="w-full mt-2 text-gray-500 hover:text-primary-600 underline" onClick={() => navigate(-1)}>
          Back
        </button>
        {/* Responded Donors List for Receiver */}
        {user?._id === request.requestedBy?._id && request.donors && request.donors.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Responded Donors</h2>
            <div className="space-y-2">
              {request.donors.map((d, idx) => (
                <div key={idx} className="p-3 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-medium">{d.donor?.name}</span> ({d.donor?.bloodGroup})
                    <span className="ml-2 text-gray-500">{d.donor?.phone}</span>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${d.status === 'accepted' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails; 