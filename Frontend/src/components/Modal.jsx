import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className={`relative bg-white w-full ${maxWidth} rounded-lg shadow-xl border border-[#E5E5E7] flex flex-col max-h-[90vh] sm:max-h-[85vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E7]">
          <h2 className="text-lg font-semibold text-[#1C1C1E]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#6B6B70] hover:text-[#1C1C1E] hover:bg-[#F7F7F8] p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
