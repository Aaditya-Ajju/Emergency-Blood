import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    urgency: '',
    radius: 50 // km
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/blood-requests', {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(response.data.requests);
    } catch (error) {
      setError('Failed to fetch blood requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMarkerColor = (urgency) => {
    return urgency === 'high' ? 'red' : 'blue';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Urgency
            </label>
            <select
              name="urgency"
              value={filters.urgency}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="">All Urgency Levels</option>
              <option value="normal">Normal</option>
              <option value="high">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search Radius (km)
            </label>
            <input
              type="number"
              name="radius"
              value={filters.radius}
              onChange={handleFilterChange}
              min="1"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="h-[600px] rounded-lg overflow-hidden">
          <MapContainer
            center={[20.5937, 78.9629]} // Center of India
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {requests.map((request) => (
              <Marker
                key={request._id}
                position={[
                  request.location.coordinates[1],
                  request.location.coordinates[0]
                ]}
                icon={L.divIcon({
                  className: `custom-marker ${getMarkerColor(request.urgency)}`,
                  html: `<div class="marker-pin ${getMarkerColor(request.urgency)}"></div>`,
                  iconSize: [30, 42],
                  iconAnchor: [15, 42]
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-lg">
                      {request.bloodGroup} Blood Needed
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.location.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      Contact: {request.contact}
                    </p>
                    <p className="text-sm text-gray-600">
                      Urgency: {request.urgency}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        Notes: {request.notes}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Blood Requests</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        {requests.length === 0 ? (
          <p className="text-gray-500">No blood requests found.</p>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {request.bloodGroup} Blood Needed
                    </h3>
                    <p className="text-gray-600">{request.location.address}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      request.urgency === 'high'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.urgency === 'high' ? 'Urgent' : 'Normal'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Contact: {request.contact}</p>
                  {request.notes && <p className="mt-1">Notes: {request.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Map; 