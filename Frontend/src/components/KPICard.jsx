import React from 'react';

const KPICard = ({ title, value, icon: Icon, type = 'info', subtitle }) => {
  
  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-t-[#16A34A]';
      case 'warning': return 'border-t-[#D97706]';
      case 'error': return 'border-t-[#DC2626]';
      case 'info':
      default: return 'border-t-[#2563EB]';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return 'text-[#16A34A] bg-green-50';
      case 'warning': return 'text-[#D97706] bg-amber-50';
      case 'error': return 'text-[#DC2626] bg-red-50';
      case 'info':
      default: return 'text-[#2563EB] bg-blue-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-[#E5E5E7] border-t-[3px] ${getBorderColor()} p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#6B6B70]">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-[#1C1C1E] tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${getIconColor()}`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-4 text-sm text-[#6B6B70] font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default KPICard;
