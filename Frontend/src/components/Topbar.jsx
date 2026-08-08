import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, UserCircle, Menu } from 'lucide-react';

const Topbar = () => {
  const { fullName, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/vehicles')) return 'Vehicles';
    if (path.startsWith('/drivers')) return 'Drivers';
    if (path.startsWith('/trips')) return 'Trips';
    if (path.startsWith('/maintenance')) return 'Maintenance';
    if (path.startsWith('/fuel')) return 'Fuel & Expenses';
    if (path.startsWith('/reports')) return 'Reports';
    return 'TransitOps';
  }, [location.pathname]);

  const formatRole = (r) => {
    if (!r) return '';
    return r.replace('_', ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <button className="lg:hidden mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-100">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-gray-700">{fullName || 'User'}</span>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full self-end mt-0.5">
              {formatRole(role)}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200 text-brand-600">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5 sm:mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
