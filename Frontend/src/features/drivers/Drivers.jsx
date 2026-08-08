import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, Search } from 'lucide-react';
import { driverApi } from '../../api/driverApi';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License Number is required'),
  contactNumber: z.string().min(1, 'Contact Number is required'),
});

export default function Drivers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: driversData, isLoading } = useQuery({
    queryKey: ['drivers', searchTerm],
    queryFn: () => driverApi.getAll({ search: searchTerm }),
  });

  const drivers = Array.isArray(driversData) ? driversData : driversData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(driverSchema),
  });

  const createMutation = useMutation({
    mutationFn: driverApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to create driver');
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Drivers</h1>
          <p className="text-[#6B6B70] mt-1">Manage your driver personnel</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Driver
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm p-4 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E5E5E7] rounded-lg focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">License Number</th>
              <th className="p-4 font-medium">Contact Number</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E7]">
            {isLoading ? (
              <tr><td colSpan="4" className="p-4 text-center text-[#6B6B70]">Loading...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-[#6B6B70]">No drivers found.</td></tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-[#1C1C1E] font-medium">{driver.name}</td>
                  <td className="p-4 text-[#6B6B70]">{driver.licenseNumber}</td>
                  <td className="p-4 text-[#6B6B70]">{driver.contactNumber}</td>
                  <td className="p-4 text-[#6B6B70]">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {driver.status}
                    </span>
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
              <h2 className="text-lg font-bold text-[#1C1C1E]">Add New Driver</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Name</label>
                <input
                  {...register('name')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">License Number</label>
                <input
                  {...register('licenseNumber')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="DL-12345678"
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Contact Number</label>
                <input
                  {...register('contactNumber')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="+1 (555) 000-0000"
                />
                {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
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
                  {createMutation.isPending ? 'Saving...' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
