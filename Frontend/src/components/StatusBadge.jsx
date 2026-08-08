import React from 'react';

const getStatusStyles = (status) => {
  const normStatus = (status || '').toUpperCase();
  
  if (['AVAILABLE', 'ACTIVE', 'COMPLETED', 'SUCCESS'].includes(normStatus)) {
    return 'bg-green-100 text-[#16A34A] border-green-200';
  }
  
  if (['ON_TRIP', 'DISPATCHED', 'INFO'].includes(normStatus)) {
    return 'bg-blue-100 text-[#2563EB] border-blue-200';
  }
  
  if (['IN_SHOP', 'DRAFT', 'EXPIRING', 'WARNING'].includes(normStatus)) {
    return 'bg-amber-100 text-[#D97706] border-amber-200';
  }
  
  if (['RETIRED', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'ERROR'].includes(normStatus)) {
    return 'bg-red-100 text-[#DC2626] border-red-200';
  }
  
  return 'bg-[#F7F7F8] text-[#6B6B70] border-[#E5E5E7]';
};

const formatStatus = (status) => {
  if (!status) return 'UNKNOWN';
  return status.replace(/_/g, ' ').toUpperCase();
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${getStatusStyles(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
