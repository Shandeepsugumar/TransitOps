import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, Check, AlertTriangle } from 'lucide-react';
import { maintenanceApi } from '../../api/maintenanceApi';
import { vehicleApi } from '../../api/vehicleApi';

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const maintenanceSchema = z.object({
  vehicleId: z.number().min(1, 'Vehicle is required'),
  maintenanceType: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  cost: z.number().min(0, 'Cost must be positive'),
  date: z.string().min(1, 'Date is required'),
});

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.getAll(),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Maintenance logged successfully');
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to log maintenance'),
  });

  const closeMutation = useMutation({
    mutationFn: (id) => maintenanceApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Maintenance closed successfully');
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to close maintenance'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const activeVehicles = vehicles.filter(v => v.status !== 'RETIRED');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Tracking</h1>
        <button
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Maintenance
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading maintenance records...</td>
              </tr>
            ) : records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.vehicleRegistration || record.registrationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.maintenanceType}</td>
                <td className="px-6 py-4 whitespace-nowrap">${record.cost?.toFixed(2)}</td>
                <td className="px-6 py-4">{record.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {record.status === 'ACTIVE' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to close this maintenance record?')) {
                          closeMutation.mutate(record.id);
                        }
                      }}
                      className="text-green-600 hover:text-green-900 flex justify-end items-center ml-auto"
                      title="Close"
                    >
                      <Check className="w-5 h-5 mr-1" /> Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Log Maintenance</h2>
            
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Creating this record will set the vehicle to In Shop.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select {...register('vehicleId', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Select Vehicle</option>
                  {activeVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maintenance Type</label>
                <input {...register('maintenanceType')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.maintenanceType && <p className="text-red-500 text-xs mt-1">{errors.maintenanceType.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
                <input type="number" step="0.01" {...register('cost', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" {...register('date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
