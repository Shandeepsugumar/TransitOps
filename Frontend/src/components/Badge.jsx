import clsx from 'clsx';

const statusStyles = {
  Available: 'bg-green-100 text-green-800 border-green-200',
  'On Trip': 'bg-blue-100 text-blue-800 border-blue-200',
  'In Shop': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Retired: 'bg-gray-100 text-gray-800 border-gray-200',
  'Off Duty': 'bg-gray-100 text-gray-800 border-gray-200',
  Suspended: 'bg-red-100 text-red-800 border-red-200',
  Draft: 'bg-slate-100 text-slate-800 border-slate-200',
  Dispatched: 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export const Badge = ({ status, className }) => {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  
  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      style,
      className
    )}>
      {status}
    </span>
  );
};
