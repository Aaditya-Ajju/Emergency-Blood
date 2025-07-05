import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTint, FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/users/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotification(res.data);
      } catch (error) {
        toast.error('Failed to fetch notification');
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>;
  }
  if (!notification) {
    return <div className="min-h-screen flex items-center justify-center">Notification not found.</div>;
  }

  const donor = notification.sender;
  const req = notification.relatedRequest;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center"><FaTint className="text-primary-600 mr-2" /> Donor Response Details</h1>
        <div className="mb-6">
          <div className="mb-2 text-lg font-semibold">Request Details</div>
          {req && (
            <div className="mb-4 p-4 rounded bg-gray-50 border">
              <div><b>Patient:</b> {req.patientName}</div>
              <div><b>Blood Group:</b> {req.bloodGroup}</div>
              <div><b>Hospital:</b> {req.hospitalName}</div>
              <div><b>Location:</b> {req.city}, {req.state}</div>
            </div>
          )}
          <div className="mb-2 text-lg font-semibold">Donor Details</div>
          {donor && (
            <div className="mb-4 p-4 rounded bg-primary-50 border border-primary-200">
              <div><b>Name:</b> {donor.name}</div>
              <div><b>Blood Group:</b> {donor.bloodGroup}</div>
              <div><b>Location:</b> {donor.city}, {donor.state}</div>
              <div><b>Phone:</b> <a href={`tel:${donor.phone}`} className="text-primary-600 underline">{donor.phone}</a></div>
            </div>
          )}
        </div>
        <button className="btn-primary w-full" onClick={() => window.close()}>Close</button>
      </div>
    </div>
  );
};

export default NotificationDetails; 