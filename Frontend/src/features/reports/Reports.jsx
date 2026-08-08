import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../../api/reportsApi';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('fuel-efficiency');

  const { data: fuelEfficiency = [], isLoading: isLoadingFuel } = useQuery({
    queryKey: ['reports', 'fuel-efficiency'],
    queryFn: () => reportsApi.getFuelEfficiency(),
    enabled: activeTab === 'fuel-efficiency',
  });

  const { data: operationalCost = [], isLoading: isLoadingCost } = useQuery({
    queryKey: ['reports', 'operational-cost'],
    queryFn: () => reportsApi.getOperationalCost(),
    enabled: activeTab === 'operational-cost',
  });

  const { data: roi = [], isLoading: isLoadingRoi } = useQuery({
    queryKey: ['reports', 'roi'],
    queryFn: () => reportsApi.getRoi(),
    enabled: activeTab === 'roi',
  });

  const handleDownloadCsv = async (type) => {
    try {
      const blob = await reportsApi.exportCsv(type);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV', error);
    }
  };

  const renderFuelEfficiency = () => (
    <div className="space-y-6">
      <div className="h-80 bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fuelEfficiency} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="registrationNumber" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency (km/L)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Distance (km)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fuel (L)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency (km/L)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoadingFuel ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : fuelEfficiency.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap">{item.registrationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.totalDistance?.toFixed(2) || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.totalFuel?.toFixed(2) || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.efficiency?.toFixed(2) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOperationalCost = () => (
    <div className="space-y-6">
      <div className="h-80 bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={operationalCost} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="registrationNumber" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="fuelCost" stackId="a" fill="#ef4444" name="Fuel Cost ($)" />
            <Bar dataKey="maintenanceCost" stackId="a" fill="#f59e0b" name="Maintenance Cost ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maintenance Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoadingCost ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : operationalCost.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap">{item.registrationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.fuelCost?.toFixed(2) || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.maintenanceCost?.toFixed(2) || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">${((item.fuelCost || 0) + (item.maintenanceCost || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRoi = () => (
    <div className="space-y-6">
      <div className="h-80 bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={roi} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="registrationNumber" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="roi" fill="#10b981" name="ROI (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoadingRoi ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : roi.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap">{item.registrationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.revenue?.toFixed(2) || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.totalCost?.toFixed(2) || 0}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-bold ${(item.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.roi?.toFixed(2) || 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <button
          onClick={() => handleDownloadCsv(activeTab)}
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'fuel-efficiency', label: 'Fuel Efficiency' },
            { id: 'operational-cost', label: 'Operational Cost' },
            { id: 'roi', label: 'ROI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'fuel-efficiency' && renderFuelEfficiency()}
        {activeTab === 'operational-cost' && renderOperationalCost()}
        {activeTab === 'roi' && renderRoi()}
      </div>
    </div>
  );
}
