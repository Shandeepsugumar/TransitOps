import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, Search, Edit2 } from 'lucide-react';
import { driverApi } from '../../api/driverApi';
import { useAuthStore } from '../../store/authStore';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License Number is required'),
  licenseCategory: z.string().min(1, 'License Category is required'),
  licenseExpiryDate: z.string().min(1, 'Expiry Date is required'),
  contactNumber: z.string().min(1, 'Contact Number is required'),
  safetyScore: z.number().min(0).max(100),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED']),
});

export default function Drivers() {
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const canModify = role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: driversData, isLoading } = useQuery({
    queryKey: ['drivers', searchTerm],
    queryFn: () => driverApi.getAll({ search: searchTerm }),
  });

  const drivers = Array.isArray(driversData) ? driversData : driversData?.data || [];

  const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      status: 'AVAILABLE',
      safetyScore: 100
    }
  });

  const createMutation = useMutation({
    mutationFn: driverApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver created successfully');
      handleCloseModal();
    },
    onError: (error) => {
      if (error.response?.status === 409 || error.backendMessage?.includes('licenseNumber')) {
        setError('licenseNumber', { type: 'manual', message: 'License number already exists' });
      } else {
        toast.error(error.backendMessage || 'Failed to create driver');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driverApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
      handleCloseModal();
    },
    onError: (error) => {
      if (error.response?.status === 409 || error.backendMessage?.includes('licenseNumber')) {
        setError('licenseNumber', { type: 'manual', message: 'License number already exists' });
      } else {
        toast.error(error.backendMessage || 'Failed to update driver');
      }
    }
  });

  const handleOpenModal = (driver = null) => {
    setEditingDriver(driver);
    if (driver) {
      setValue('name', driver.name);
      setValue('licenseNumber', driver.licenseNumber);
      setValue('licenseCategory', driver.licenseCategory);
      setValue('licenseExpiryDate', driver.licenseExpiryDate);
      setValue('contactNumber', driver.contactNumber);
      setValue('safetyScore', driver.safetyScore);
      setValue('status', driver.status);
    } else {
      reset({
        name: '',
        licenseNumber: '',
        licenseCategory: '',
        licenseExpiryDate: '',
        contactNumber: '',
        safetyScore: 100,
        status: 'AVAILABLE'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isExpiringSoon = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(expiryDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return expiryDate < today || diffDays <= 30;
  };

  return (
    <div className="space-y-6 bg-[#F7F7F8] min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Drivers</h1>
          <p className="text-[#6B6B70] mt-1">Manage your driver personnel</p>
        </div>
        {canModify && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Driver
          </button>
        )}
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

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">License Info</th>
              <th className="p-4 font-medium">Expiry Date</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Safety Score</th>
              <th className="p-4 font-medium">Status</th>
              {canModify && <th className="p-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E7]">
            {isLoading ? (
              <tr><td colSpan={canModify ? 7 : 6} className="p-8 text-center text-[#6B6B70]">Loading...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan={canModify ? 7 : 6} className="p-8 text-center text-[#6B6B70]">No drivers found.</td></tr>
            ) : (
              drivers.map((driver) => {
                const expiring = isExpiringSoon(driver.licenseExpiryDate);
                return (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 text-[#1C1C1E] font-medium">{driver.name}</td>
                    <td className="p-4 text-[#6B6B70]">
                      <div>{driver.licenseNumber}</div>
                      <div className="text-xs text-gray-400">{driver.licenseCategory}</div>
                    </td>
                    <td className="p-4">
                      <span className={`${expiring ? 'text-red-600 font-semibold' : 'text-[#6B6B70]'}`}>
                        {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                      </span>
                      {expiring && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Expiring/Expired</span>}
                    </td>
                    <td className="p-4 text-[#6B6B70]">{driver.contactNumber}</td>
                    <td className="p-4 text-[#6B6B70]">
                      <span className={`font-medium ${driver.safetyScore >= 90 ? 'text-green-600' : driver.safetyScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {driver.safetyScore}
                      </span>
                    </td>
                    <td className="p-4 text-[#6B6B70]">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                        driver.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700' :
                        driver.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    {canModify && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenModal(driver)}
                          className="text-[#D97706] hover:text-amber-800 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-[#E5E5E7]">
            <div className="flex justify-between items-center p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form method="post" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Name</label>
                  <input
                    {...register('name')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Contact Number</label>
                  <input
                    {...register('contactNumber')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">License Number</label>
                  <input
                    {...register('licenseNumber')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">License Category</label>
                  <input
                    {...register('licenseCategory')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                    placeholder="e.g. CDL-A"
                  />
                  {errors.licenseCategory && <p className="text-red-500 text-xs mt-1">{errors.licenseCategory.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Expiry Date</label>
                  <input
                    {...register('licenseExpiryDate')}
                    type="date"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errors.licenseExpiryDate && <p className="text-red-500 text-xs mt-1">{errors.licenseExpiryDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Safety Score (0-100)</label>
                  <input
                    {...register('safetyScore', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errors.safetyScore && <p className="text-red-500 text-xs mt-1">{errors.safetyScore.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Save Driver')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
