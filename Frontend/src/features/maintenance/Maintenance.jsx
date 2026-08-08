import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, Wrench, AlertTriangle } from 'lucide-react';
import { maintenanceApi } from '../../api/maintenanceApi';
import { vehicleApi } from '../../api/vehicleApi';

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  description: z.string().min(1, 'Description is required'),
  cost: z.number().min(0, 'Cost must be positive'),
});

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: maintData, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.getAll(),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const maintenanceList = Array.isArray(maintData) ? maintData : maintData?.data || [];
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(maintenanceSchema),
  });

  const createMutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Maintenance record added');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to add record'),
  });

  const closeMutation = useMutation({
    mutationFn: maintenanceApi.close,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Maintenance closed successfully');
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to close maintenance'),
  });

  const onSubmit = (data) => createMutation.mutate(data);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Maintenance</h1>
          <p className="text-[#6B6B70] mt-1">Manage vehicle maintenance tasks and logs</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Maintenance
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">Pending Maintenance</h3>
          <p className="text-sm text-amber-700 mt-1">
            You have {maintenanceList.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length} maintenance tasks that need attention. Keep your fleet in top condition!
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
            <tr>
              <th className="p-4 font-medium">Vehicle</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Cost</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E7]">
            {isLoading ? (
              <tr><td colSpan="5" className="p-4 text-center text-[#6B6B70]">Loading...</td></tr>
            ) : maintenanceList.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-[#6B6B70]">No maintenance records found.</td></tr>
            ) : (
              maintenanceList.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-[#1C1C1E] font-medium">{m.vehicle?.licensePlate || m.vehicleId}</td>
                  <td className="p-4 text-[#6B6B70] max-w-xs truncate">{m.description}</td>
                  <td className="p-4 text-[#1C1C1E]">${m.cost?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    {m.status !== 'COMPLETED' && (
                      <button
                        onClick={() => closeMutation.mutate(m.id)}
                        className="px-3 py-1 bg-[#D97706] text-white text-sm rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1"
                      >
                        <Wrench className="w-4 h-4" /> Close
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-[#E5E5E7]">
            <div className="flex justify-between items-center p-4 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Log Maintenance</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Vehicle</label>
                <select
                  {...register('vehicleId')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.licensePlate} - {v.model}</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-red-500 text-sm mt-1">{errors.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="Describe the maintenance performed..."
                  rows="3"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Estimated Cost</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.00"
                />
                {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
