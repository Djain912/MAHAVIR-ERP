/**
 * Modal Component
 * Reusable modal dialog component
 */

import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} border border-gray-100`}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="text-xl font-bold text-black">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
