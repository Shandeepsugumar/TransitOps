import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reportsApi';
import DataTable from '../../components/DataTable';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('fuel');

  const { data: fuelData = [], isLoading: loadFuel } = useQuery({
    queryKey: ['reports', 'fuel'],
    queryFn: () => reportsApi.getFuelEfficiency().then(res => res.data),
    enabled: activeTab === 'fuel'
  });

  const { data: costData = [], isLoading: loadCost } = useQuery({
    queryKey: ['reports', 'cost'],
    queryFn: () => reportsApi.getOperationalCost().then(res => res.data),
    enabled: activeTab === 'cost'
  });

  const { data: roiData = [], isLoading: loadRoi } = useQuery({
    queryKey: ['reports', 'roi'],
    queryFn: () => reportsApi.getRoi().then(res => res.data),
    enabled: activeTab === 'roi'
  });

  const handleExport = async (type) => {
    try {
      const response = await reportsApi.exportCsv(type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  const tabs = [
    { id: 'fuel', label: 'Fuel Efficiency' },
    { id: 'cost', label: 'Operational Cost' },
    { id: 'roi', label: 'ROI' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Reports</h1>
        <button 
          onClick={() => handleExport(activeTab)}
          className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" /> Download CSV
        </button>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'fuel' && (
          <>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                  <XAxis dataKey="vehicleReg" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }} />
                  <Bar dataKey="efficiency" fill="#000000" radius={[4, 4, 0, 0]} name="Efficiency (km/L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <DataTable 
                data={fuelData} 
                isLoading={loadFuel}
                columns={[
                  { header: 'Vehicle', accessorKey: 'vehicleReg' },
                  { header: 'Total Distance', cell: (_, row) => `${row.totalDistance} km` },
                  { header: 'Total Fuel', cell: (_, row) => `${row.totalFuel} L` },
                  { header: 'Efficiency', cell: (_, row) => `${row.efficiency.toFixed(2)} km/L` }
                ]}
              />
            </div>
          </>
        )}

        {activeTab === 'cost' && (
          <>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                  <XAxis dataKey="vehicleReg" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }} />
                  <Bar dataKey="fuelCost" stackId="a" fill="#000000" name="Fuel Cost ($)" />
                  <Bar dataKey="maintenanceCost" stackId="a" fill="#666666" name="Maintenance Cost ($)" />
                  <Bar dataKey="otherExpenses" stackId="a" fill="#cccccc" radius={[4, 4, 0, 0]} name="Other Expenses ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <DataTable 
                data={costData} 
                isLoading={loadCost}
                columns={[
                  { header: 'Vehicle', accessorKey: 'vehicleReg' },
                  { header: 'Fuel Cost', cell: (_, row) => `$${row.fuelCost.toFixed(2)}` },
                  { header: 'Maintenance', cell: (_, row) => `$${row.maintenanceCost.toFixed(2)}` },
                  { header: 'Other', cell: (_, row) => `$${row.otherExpenses.toFixed(2)}` },
                  { header: 'Total', cell: (_, row) => `$${row.totalCost.toFixed(2)}` }
                ]}
              />
            </div>
          </>
        )}

        {activeTab === 'roi' && (
          <>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                  <XAxis dataKey="vehicleReg" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }} />
                  <Bar dataKey="roi" fill="#000000" radius={[4, 4, 0, 0]} name="ROI (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <DataTable 
                data={roiData} 
                isLoading={loadRoi}
                columns={[
                  { header: 'Vehicle', accessorKey: 'vehicleReg' },
                  { header: 'Revenue', cell: (_, row) => `$${row.revenue.toFixed(2)}` },
                  { header: 'Total Cost', cell: (_, row) => `$${row.totalCost.toFixed(2)}` },
                  { header: 'Profit/Loss', cell: (_, row) => `$${row.profitLoss.toFixed(2)}` },
                  { 
                    header: 'ROI', 
                    cell: (_, row) => (
                      <span className={row.roi >= 0 ? 'font-bold text-black' : 'text-neutral-400'}>
                        {row.roi.toFixed(2)}%
                      </span>
                    )
                  }
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
