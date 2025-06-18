import React from 'react';
import { CheckCircleIcon, UserIcon, PhoneIcon, DropletIcon } from '@heroicons/react/24/outline';

const NotificationsDropdown = ({ notifications, onMarkCompleted }) => (
  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200">
    <div className="p-4 border-b font-bold text-lg flex items-center gap-2">
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
      Notifications
    </div>
    {notifications.length === 0 ? (
      <div className="p-6 text-gray-400 text-center text-base">No notifications yet.</div>
    ) : (
      notifications.map((notif) => (
        <div key={notif._id} className="p-4 border-b last:border-b-0 flex flex-col gap-2 hover:bg-gray-50 transition-all rounded-lg">
          <div className="flex items-center gap-2 font-semibold text-red-700">
            <UserIcon className="w-5 h-5 text-gray-500" />
            Responder: {notif.responder?.name || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="flex items-center gap-1"><span className="font-medium">Age:</span> {notif.responder?.age || 'N/A'}</span>
            <span className="flex items-center gap-1"><DropletIcon className="w-4 h-4 text-red-400" />{notif.responder?.bloodGroup || 'N/A'}</span>
            <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4 text-blue-400" />{notif.responder?.phone || 'N/A'}</span>
          </div>
          <button
            className={`mt-2 px-3 py-1 rounded font-medium shadow-sm transition-all ${
              notif.isCompleted
                ? 'bg-green-100 text-green-700 cursor-not-allowed flex items-center gap-1'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={() => onMarkCompleted(notif._id)}
            disabled={notif.isCompleted}
          >
            {notif.isCompleted ? <><CheckCircleIcon className="w-5 h-5" /> Completed</> : 'Mark as Completed'}
          </button>
        </div>
      ))
    )}
  </div>
);

export default NotificationsDropdown; 