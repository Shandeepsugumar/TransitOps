import React from 'react';

const KPICard = ({ title, value, icon: Icon, subtitle }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-black tracking-tight">{value}</h4>
        </div>
        <div className="bg-neutral-100 rounded-lg p-3 text-black">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {subtitle && (
        <p className="mt-4 text-xs font-medium text-neutral-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
