import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { reportsApi } from '../../api/reportsApi';
import toast from 'react-hot-toast';

export default function Reports() {
  const { data: efficiencyData, isLoading: isLoadingEff } = useQuery({
    queryKey: ['fuelEfficiency'],
    queryFn: () => reportsApi.getFuelEfficiency(),
  });

  const { data: costData, isLoading: isLoadingCost } = useQuery({
    queryKey: ['operationalCost'],
    queryFn: () => reportsApi.getOperationalCost(),
  });

  const handleExport = async (type) => {
    try {
      await reportsApi.exportCsv(type);
      toast.success(`Exported ${type} report successfully`);
    } catch (error) {
      toast.error(error.backendMessage || `Failed to export ${type} report`);
    }
  };

  const effChartData = Array.isArray(efficiencyData) ? efficiencyData : efficiencyData?.data || [];
  const costChartData = Array.isArray(costData) ? costData : costData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Reports & Analytics</h1>
          <p className="text-[#6B6B70] mt-1">Insights and metrics for your fleet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#1C1C1E]">Operational Costs</h2>
            <button
              onClick={() => handleExport('costs')}
              className="bg-[#D97706] text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 flex items-center transition-colors text-sm shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
          <div className="h-72">
            {isLoadingCost ? (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B70]">Loading...</div>
            ) : costChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B70]">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E7" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B6B70'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B6B70'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E7' }}
                  />
                  <Bar dataKey="cost" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#1C1C1E]">Fuel Efficiency</h2>
            <button
              onClick={() => handleExport('efficiency')}
              className="bg-[#D97706] text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 flex items-center transition-colors text-sm shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
          <div className="h-72">
            {isLoadingEff ? (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B70]">Loading...</div>
            ) : effChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B70]">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={effChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E7" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B6B70'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B6B70'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E7' }}
                  />
                  <Line type="monotone" dataKey="efficiency" stroke="#16A34A" strokeWidth={3} dot={{r: 4, fill: '#16A34A', strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
