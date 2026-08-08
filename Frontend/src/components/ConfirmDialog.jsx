import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDestructive = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${isDestructive ? 'bg-red-100 text-[#DC2626]' : 'bg-amber-100 text-[#D97706]'}`}>
          {isDestructive ? (
            <AlertTriangle size={28} strokeWidth={2} />
          ) : (
            <Info size={28} strokeWidth={2} />
          )}
        </div>
        <p className="text-[#6B6B70] mb-8 text-sm">
          {message}
        </p>
        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg font-medium hover:bg-[#F7F7F8] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isDestructive 
                ? 'bg-[#DC2626] hover:bg-red-700 focus:ring-[#DC2626]' 
                : 'bg-[#D97706] hover:bg-amber-700 focus:ring-[#D97706]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
