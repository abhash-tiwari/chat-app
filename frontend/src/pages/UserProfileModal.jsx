import React from 'react';
import { X } from 'lucide-react';

interface UserProfileModalProps {
  user: {
    name: string;
    email?: string;
    _id: string;
    createdAt?: string;
  };
  onClose: () => void;
}

export const UserProfileModal = ({ user, onClose }: UserProfileModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[413px] relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Name */}
          <h2 className="text-xl font-semibold text-center mb-1">
            {user.name}
          </h2>

          {/* User Email */}
          {user.email && (
            <p className="text-gray-500 text-center mb-6">
              {user.email}
            </p>
          )}

          {/* Join Date */}
          {user.createdAt && (
            <p className="text-sm text-gray-500 text-center">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};