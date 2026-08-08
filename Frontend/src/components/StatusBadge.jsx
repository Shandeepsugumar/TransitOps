import React from 'react';

const StatusBadge = ({ status, type }) => {
  let config = {
    bg: 'bg-neutral-100',
    text: 'text-black',
    dot: 'bg-black',
    extra: ''
  };

  const s = String(status).toUpperCase();

  if (type === 'vehicle') {
    if (s === 'AVAILABLE') config = { bg: 'bg-neutral-100', text: 'text-black', dot: 'bg-black' };
    else if (s === 'ON_TRIP') config = { bg: 'bg-black', text: 'text-white', dot: 'bg-white' };
    else if (s === 'IN_SHOP') config = { bg: 'bg-neutral-200', text: 'text-neutral-700', dot: 'bg-neutral-500' };
    else if (s === 'RETIRED') config = { bg: 'bg-neutral-100', text: 'text-neutral-400', dot: 'bg-neutral-300', extra: 'line-through' };
  } else if (type === 'driver') {
    if (s === 'AVAILABLE') config = { bg: 'bg-neutral-100', text: 'text-black', dot: 'bg-black' };
    else if (s === 'ON_TRIP') config = { bg: 'bg-black', text: 'text-white', dot: 'bg-white' };
    else if (s === 'OFF_DUTY') config = { bg: 'bg-neutral-100', text: 'text-neutral-400', dot: 'bg-neutral-400' };
    else if (s === 'SUSPENDED') config = { bg: 'bg-black', text: 'text-white', dot: 'bg-white', extra: 'border-2 border-black' };
  } else if (type === 'trip') {
    if (s === 'DRAFT') config = { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' };
    else if (s === 'DISPATCHED') config = { bg: 'bg-black', text: 'text-white', dot: 'bg-white' };
    else if (s === 'COMPLETED') config = { bg: 'bg-neutral-200', text: 'text-black', dot: 'bg-black' };
    else if (s === 'CANCELLED') config = { bg: 'bg-neutral-100', text: 'text-neutral-400', dot: 'bg-neutral-300', extra: 'line-through' };
  } else if (type === 'maintenance') {
    if (s === 'ACTIVE') config = { bg: 'bg-black', text: 'text-white', dot: 'bg-white' };
    else if (s === 'CLOSED') config = { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' };
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.extra}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {s.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
