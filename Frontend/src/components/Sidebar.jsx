import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  CreditCard, 
  BarChart3,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { name: 'Drivers', path: '/drivers', icon: Users, roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
    { name: 'Trips', path: '/trips', icon: Map, roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['FLEET_MANAGER'] },
    { name: 'Fuel & Expenses', path: '/expenses', icon: CreditCard, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  ];

  const allowedItems = navItems.filter(item => 
    !item.roles || item.roles.length === 0 || (role && item.roles.includes(role))
  );

  // If role is missing but we want dashboard to show up for all, we can adjust above.
  // Actually the prompt says "Dashboard (all roles)".
  const finalItems = navItems.filter(item => {
    if (item.name === 'Dashboard' || item.name === 'Trips') return true;
    return role && item.roles.includes(role);
  });

  return (
    <aside className="w-64 bg-black text-white flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <h1 className="text-xl font-bold tracking-tight">TransitOps</h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {finalItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${isActive 
                ? 'bg-white/10 text-white relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-white before:rounded-r-md' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
