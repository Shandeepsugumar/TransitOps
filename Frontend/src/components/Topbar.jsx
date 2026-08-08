import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User } from 'lucide-react';

const Topbar = () => {
  const { fullName, role, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Dashboard';
    const path = pathname.split('/')[1];
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
      <h2 className="text-lg font-semibold text-black">
        {getPageTitle(location.pathname)}
      </h2>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex flex-col items-end leading-tight">
            <span className="font-medium text-black">{fullName || 'User'}</span>
            {role && (
              <span className="px-2 py-0.5 mt-1 rounded-full bg-neutral-200 text-black text-[10px] font-bold tracking-wider uppercase">
                {role.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600">
            <User className="w-5 h-5" />
          </div>
        </div>
        
        <div className="w-px h-6 bg-neutral-200"></div>
        
        <button 
          onClick={handleLogout}
          className="text-neutral-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
