import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Heart, Clock } from 'lucide-react';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ requests = [], userLocation, onMarkerClick, height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Custom icons for different urgency levels
  const createCustomIcon = (urgency, status) => {
    const getColor = () => {
      if (status !== 'Active') return '#6B7280'; // Gray for inactive
      switch (urgency) {
        case 'Critical': return '#DC2626'; // Red
        case 'High': return '#EA580C'; // Orange
        case 'Medium': return '#D97706'; // Amber
        case 'Low': return '#059669'; // Green
        default: return '#3B82F6'; // Blue
      }
    };

    const color = getColor();
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      ">
        🩸
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = userLocation 
      ? [userLocation.coordinates[1], userLocation.coordinates[0]]
      : [40.7128, -74.0060]; // Default to NYC

    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="
            background-color: #3B82F6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            📍
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userLocation.coordinates[1], userLocation.coordinates[0]], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Your Location</b>');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Update markers when requests change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    requests.forEach(request => {
      if (request.location && request.location.coordinates) {
        const [lng, lat] = request.location.coordinates;
        const icon = createCustomIcon(request.urgency, request.status);
        
        const marker = L.marker([lat, lng], { icon })
          .addTo(mapInstanceRef.current);

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[250px]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">${request.patientName || 'N/A'}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full ${
                request.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                request.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                request.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }">${request.urgency}</span>
            </div>
            <div class="space-y-1 text-sm text-gray-600 mb-3">
              <div class="flex items-center">
                <span class="font-medium text-red-600 mr-2">${request.bloodGroup || 'N/A'}</span>
                <span>• ${request.unitsNeeded || 'N/A'} units needed</span>
              </div>
              <div>${request.hospital?.name || 'N/A'}</div>
              <div class="flex items-center">
                <span class="mr-1">📞</span>
                ${request.contact || 'N/A'}
              </div>
            </div>
            ${request.description ? `<p class="text-sm text-gray-600 mb-3">${request.description}</p>` : ''}
            <button 
              onclick="window.viewRequestDetails('${request._id}')"
              class="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              View Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(request));
        }

        markersRef.current.push(marker);
      }
    });

    // Fit map to markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }, [requests, onMarkerClick]);

  // Global function for popup buttons
  useEffect(() => {
    window.viewRequestDetails = (requestId) => {
      if (onMarkerClick) {
        const request = requests.find(r => r._id === requestId);
        if (request) onMarkerClick(request);
      }
    };

    return () => {
      delete window.viewRequestDetails;
    };
  }, [requests, onMarkerClick]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 shadow-sm"
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
            <span>High</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span>Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;