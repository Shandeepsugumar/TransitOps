import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, Users, Map, Wrench, CheckCircle, Clock, Percent } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { tripApi } from '../../api/tripApi';

export default function Dashboard() {
  const [filters, setFilters] = useState({ type: '', status: '', region: '' });

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis', filters],
    queryFn: () => dashboardApi.getKpis(filters),
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Vehicles', value: kpis?.totalVehicles || 0, icon: Truck, color: 'text-[#1C1C1E]', bg: 'bg-gray-100', border: 'border-t-[3px] border-gray-400' },
    { title: 'Available Vehicles', value: kpis?.availableVehicles || 0, icon: CheckCircle, color: 'text-[#16A34A]', bg: 'bg-green-50', border: 'border-t-[3px] border-[#16A34A]' },
    { title: 'In Maintenance', value: kpis?.inMaintenance || 0, icon: Wrench, color: 'text-[#D97706]', bg: 'bg-amber-50', border: 'border-t-[3px] border-[#D97706]' },
    { title: 'Active Trips', value: kpis?.activeTrips || 0, icon: Map, color: 'text-[#2563EB]', bg: 'bg-blue-50', border: 'border-t-[3px] border-[#2563EB]' },
    { title: 'Pending Trips', value: kpis?.pendingTrips || 0, icon: Clock, color: 'text-[#6B6B70]', bg: 'bg-gray-50', border: 'border-t-[3px] border-gray-300' },
    { title: 'Drivers On Duty', value: kpis?.driversOnDuty || 0, icon: Users, color: 'text-[#16A34A]', bg: 'bg-green-50', border: 'border-t-[3px] border-[#16A34A]' },
    { title: 'Fleet Utilization', value: `${kpis?.fleetUtilization || 0}%`, icon: Percent, color: 'text-[#D97706]', bg: 'bg-amber-50', border: 'border-t-[3px] border-[#D97706]' },
  ];

  const fleetStatusData = [
    { name: 'Available', value: kpis?.availableVehicles || 0, color: '#16A34A' },
    { name: 'On Trip', value: kpis?.activeTrips || 0, color: '#2563EB' },
    { name: 'In Maintenance', value: kpis?.inMaintenance || 0, color: '#D97706' },
  ];

  const trips = tripsData?.content || [];

  return (
    <div className="p-6 bg-[#F7F7F8] min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Dashboard</h1>
        
        <div className="flex gap-2">
          <select 
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
            className="bg-white border border-[#E5E5E7] rounded-lg px-3 py-1.5 text-sm text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-[#D97706]"
          >
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-white border border-[#E5E5E7] shadow-sm rounded-lg p-5 flex items-center ${stat.border}`}
          >
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B6B70]">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[#1C1C1E]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E5E7] shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E7] text-sm text-[#6B6B70]">
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Driver</th>
                  <th className="pb-3 font-medium">Vehicle</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trips.length > 0 ? (
                  trips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-[#1C1C1E]">{trip.startLocation} → {trip.endLocation}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          trip.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#6B6B70]">{trip.driver?.fullName || 'Unassigned'}</td>
                      <td className="py-3 text-[#6B6B70]">{trip.vehicle?.registrationNumber || 'Unassigned'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-[#6B6B70]">
                      No recent trips
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
