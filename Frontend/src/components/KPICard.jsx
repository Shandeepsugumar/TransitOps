import React from 'react';

const KPICard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  // Map standard tailwind colors for the icon background
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    brand: 'bg-brand-100 text-brand-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  const iconStyle = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-4 rounded-full ${iconStyle} transition-transform duration-300 group-hover:scale-110`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
    </div>
  );
};

export default KPICard;
