import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm', 
  confirmColor = 'blue' 
}) => {
  
  const colorConfig = {
    red: {
      bg: 'bg-red-600 hover:bg-red-700',
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      iconBg: 'bg-red-100'
    },
    blue: {
      bg: 'bg-blue-600 hover:bg-blue-700',
      icon: <Info className="h-6 w-6 text-blue-600" />,
      iconBg: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-600 hover:bg-green-700',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconBg: 'bg-green-100'
    }
  };

  const config = colorConfig[confirmColor] || colorConfig.blue;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 mb-6">
        <div className={`p-3 rounded-full flex-shrink-0 ${config.iconBg}`}>
          {config.icon}
        </div>
        <div className="text-center sm:text-left mt-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${config.bg}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
