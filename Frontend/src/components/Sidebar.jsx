import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Route, 
  Wrench, 
  Banknote,
  LogOut,
  FileText,
  Building,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const { logout, fullName, role } = useAuthStore();

  const getNavItems = (userRole) => {
    if (userRole === 'SUPER_ADMIN') {
      return [
        { path: '/admin/companies', label: 'Company Approvals', icon: Building }
      ];
    }

    const items = [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

    if (userRole === 'FLEET_MANAGER') {
      items.push(
        { path: '/vehicles', label: 'Vehicles', icon: Truck },
        { path: '/drivers', label: 'Drivers', icon: Users },
        { path: '/trips', label: 'Trips', icon: Route },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/expenses', label: 'Expenses', icon: Banknote },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/team', label: 'Team', icon: Shield }
      );
    } else if (userRole === 'DRIVER') {
      items.push(
        { path: '/trips', label: 'Trips', icon: Route },
        { path: '/vehicles', label: 'Vehicles', icon: Truck },
        { path: '/drivers', label: 'Drivers', icon: Users }
      );
    } else if (userRole === 'SAFETY_OFFICER') {
      items.push(
        { path: '/drivers', label: 'Drivers', icon: Users }
      );
    } else if (userRole === 'FINANCIAL_ANALYST') {
      items.push(
        { path: '/expenses', label: 'Expenses', icon: Banknote },
        { path: '/reports', label: 'Reports', icon: FileText }
      );
    }

    return items;
  };

  const navItems = getNavItems(role);

  return (
    <aside className="w-64 bg-[#1C1C1E] flex flex-col h-screen fixed top-0 left-0 shadow-lg z-20">
      <div className="h-16 flex items-center px-6 border-b border-[#333336]">
        <h1 className="text-white text-xl font-bold tracking-tight">TransitOps</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-[#D97706] text-white shadow-sm' 
                    : 'text-[#6B6B70] hover:text-white hover:bg-[#2A2A2E]'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#333336]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold shrink-0">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{fullName}</p>
            <p className="text-xs text-[#6B6B70] truncate capitalize">{role?.replace('ROLE_', '')?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#6B6B70] hover:text-white hover:bg-[#2A2A2E] transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
