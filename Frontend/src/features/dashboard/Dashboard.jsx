import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Truck, CheckCircle, Clock, Wrench, Users, Activity, BarChart3, Loader2 } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { vehicleApi } from '../../api/vehicleApi';
import KPICard from '../../components/KPICard';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

const Dashboard = () => {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: dashboardApi.getKpis,
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  if (kpisLoading || vehiclesLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate vehicle status distribution for Pie Chart
  const vehicles = vehiclesData?.data || [];
  const statusCounts = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));

  // Data for Bar Chart
  const barData = kpis ? [
    { name: 'Active', value: kpis.activeTrips || 0 },
    { name: 'Pending', value: kpis.pendingTrips || 0 },
    { name: 'Completed', value: kpis.completedTrips || 0 },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your fleet operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <KPICard
          title="Total Vehicles"
          value={kpis?.totalVehicles || 0}
          icon={Truck}
          color="brand"
        />
        <KPICard
          title="Available Vehicles"
          value={kpis?.availableVehicles || 0}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Active Trips"
          value={kpis?.activeTrips || 0}
          icon={Activity}
          color="blue"
        />
        <KPICard
          title="Pending Trips"
          value={kpis?.pendingTrips || 0}
          icon={Clock}
          color="yellow"
        />
        <KPICard
          title="In Maintenance"
          value={kpis?.inMaintenanceVehicles || 0}
          icon={Wrench}
          color="orange"
        />
        <KPICard
          title="Drivers On Duty"
          value={kpis?.driversOnDuty || 0}
          icon={Users}
          color="purple"
        />
        <KPICard
          title="Fleet Utilization"
          value={`${kpis?.fleetUtilizationPercent || 0}%`}
          icon={BarChart3}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Vehicle Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Vehicle Status Distribution</h3>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No vehicle data available
              </div>
            )}
          </div>
        </div>

        {/* Trips Status Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Trips Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
