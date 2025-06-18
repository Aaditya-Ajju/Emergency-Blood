import React from 'react';
import { Clock, MapPin, Phone, User, Droplet, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BloodRequestCard = ({ request, onRespond, showActions = true }) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fulfilled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffInHours = Math.floor((now - requestDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-md border-l-4 hover:shadow-lg transition-all duration-300 ${
        request.urgency === 'Critical' 
          ? 'border-l-red-500 ring-1 ring-red-100' 
          : request.urgency === 'High'
          ? 'border-l-orange-500'
          : 'border-l-blue-500'
      }`}
    >
      <Link to={`/requests/${request._id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {request.bloodGroup}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{request.patientName}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <User className="w-4 h-4 mr-1" />
                {request.requester?.name || 'Unknown User'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
              {request.urgency === 'Critical' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
              {request.urgency}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        {/* TEMPORARY DEBUG: Display Request ID */}
        {request._id && (
          <p className="text-xs text-gray-400 mt-2">ID: {request._id}</p>
        )}

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Droplet className="w-4 h-4 mr-2 text-red-500" />
            <span className="font-medium">{request.unitsNeeded} units needed</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span>{request.hospital.name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-green-500" />
            <span>{request.contact}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-purple-500" />
            <span>{formatTimeAgo(request.createdAt)}</span>
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {request.description}
            </p>
          </div>
        )}

        {/* Response Count */}
        {request.responses && request.responses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {request.responses.length} donor{request.responses.length !== 1 ? 's' : ''} responded
            </p>
          </div>
        )}

        {/* "Open" arrow for visual cue, similar to the image */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>
      </Link>

      {/* Actions (Respond button remains if showActions is true and request is active) */}
      {showActions && request.status === 'Active' && (
        <div className="p-6 pt-0">
          <button
            onClick={() => onRespond(request)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-b-lg font-medium hover:bg-red-700 transition-colors duration-200"
          >
            Respond
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default BloodRequestCard;