import React from 'react';

const getStatusConfig = (type, status) => {
  const normStatus = (status || '').toUpperCase();
  
  // Default fallback
  let config = { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };

  if (type === 'vehicle') {
    switch (normStatus) {
      case 'AVAILABLE':
        config = { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
        break;
      case 'ON_TRIP':
        config = { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
        break;
      case 'IN_SHOP':
        config = { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
        break;
      case 'RETIRED':
        config = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
        break;
      default: break;
    }
  } else if (type === 'driver') {
    switch (normStatus) {
      case 'AVAILABLE':
        config = { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
        break;
      case 'ON_TRIP':
        config = { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
        break;
      case 'OFF_DUTY':
        config = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' };
        break;
      case 'SUSPENDED':
        config = { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
        break;
      default: break;
    }
  } else if (type === 'trip') {
    switch (normStatus) {
      case 'DRAFT':
        config = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
        break;
      case 'DISPATCHED':
        config = { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
        break;
      case 'COMPLETED':
        config = { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
        break;
      case 'CANCELLED':
        config = { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
        break;
      default: break;
    }
  } else if (type === 'maintenance') {
    switch (normStatus) {
      case 'ACTIVE':
        config = { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
        break;
      case 'CLOSED':
        config = { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
        break;
      default: break;
    }
  }

  return config;
};

const StatusBadge = ({ status, type }) => {
  const config = getStatusConfig(type, status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`}></span>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
