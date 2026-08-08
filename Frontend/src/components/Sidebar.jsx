import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuthStore();

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: LayoutDashboard, 
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] 
    },
    { 
      name: 'Vehicles', 
      path: '/vehicles', 
      icon: Truck, 
      roles: ['FLEET_MANAGER', 'DRIVER'] 
    },
    { 
      name: 'Drivers', 
      path: '/drivers', 
      icon: Users, 
      roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] 
    },
    { 
      name: 'Trips', 
      path: '/trips', 
      icon: Map, 
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] 
    },
    { 
      name: 'Maintenance', 
      path: '/maintenance', 
      icon: Wrench, 
      roles: ['FLEET_MANAGER'] 
    },
    { 
      name: 'Fuel & Expenses', 
      path: '/fuel', 
      icon: Fuel, 
      roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] 
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: BarChart3, 
      roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] 
    },
  ];

  // Filter items based on user role
  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex flex-col h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl flex-shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-700/50 bg-black/10">
        <Truck className="h-7 w-7 text-brand-400 mr-3" />
        <span className="text-xl font-bold tracking-tight text-white">Transit<span className="text-brand-400">Ops</span></span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-brand-600/20 text-brand-300 border-l-4 border-brand-500 font-medium' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                }
              `}
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area / Extra Info */}
      <div className="p-4 bg-black/20 border-t border-gray-700/50">
        <div className="flex items-center justify-center p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4 mr-1.5 text-brand-400" />
          <span>Secure System</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
