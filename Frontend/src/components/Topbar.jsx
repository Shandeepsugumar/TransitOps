import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Topbar = ({ onMenuClick }) => {
  const { fullName } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-[#E5E5E7] flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#6B6B70] hover:text-[#1C1C1E] lg:hidden rounded-lg hover:bg-[#F7F7F8] transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-[#6B6B70] hover:text-[#1C1C1E] hover:bg-[#F7F7F8] rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D97706] rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-px bg-[#E5E5E7] mx-2"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F7F7F8] flex items-center justify-center text-[#1C1C1E] font-medium border border-[#E5E5E7]">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
