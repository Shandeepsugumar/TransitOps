import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Truck, Users, Map, Wrench } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { tripApi } from '../../api/tripApi';

const fleetStatusData = [
  { name: 'Active', value: 45, color: '#16A34A' }, // green
  { name: 'Maintenance', value: 12, color: '#D97706' }, // amber
  { name: 'Out of Service', value: 3, color: '#DC2626' }, // red
];

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: dashboardApi.getKpis,
  });

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll({ page: 0, size: 5 }),
  });

  if (kpisLoading || tripsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vehicles',
      value: kpis?.totalVehicles || 0,
      icon: Truck,
      color: 'text-[#D97706]',
      bg: 'bg-amber-50',
    },
    {
      title: 'Active Trips',
      value: kpis?.activeTrips || 0,
      icon: Map,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Drivers',
      value: kpis?.totalDrivers || 0,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending Maintenance',
      value: kpis?.pendingMaintenance || 0,
      icon: Wrench,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const trips = tripsData?.content || [];

  return (
    <div className="p-6 bg-[#F7F7F8] min-h-screen">
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg p-6 flex items-center"
          >
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B6B70]">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[#1C1C1E]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table (2 columns wide) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E7] shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E7] text-sm text-[#6B6B70]">
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Driver</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trips.length > 0 ? (
                  trips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-[#1C1C1E]">{trip.startLocation} → {trip.endLocation}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#6B6B70]">{trip.driver?.fullName || 'N/A'}</td>
                      <td className="py-3 text-[#6B6B70]">{new Date(trip.startTime || trip.scheduledTime).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-[#6B6B70]">
                      No recent trips found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Status Pie Chart (1 column wide) */}
        <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">Fleet Status</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E5E7', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {fleetStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-[#6B6B70]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
