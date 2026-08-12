import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { vehicleApi } from '../../api/vehicleApi';
import { useAuthStore } from '../../store/authStore';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  maxLoadCapacity: z.number().min(0.1, 'Must be positive'),
  odometer: z.number().min(0, 'Must be non-negative'),
  acquisitionCost: z.number().min(0, 'Must be non-negative'),
  status: z.enum(['AVAILABLE', 'IN_SHOP', 'RETIRED']),
  region: z.string().optional(),
});

export default function Vehicles() {
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const canModify = role === 'FLEET_MANAGER';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'AVAILABLE',
      type: 'Truck',
      odometer: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle added successfully');
      closeModal();
    },
    onError: (error) => {
      if (error.response?.status === 409 || error.backendMessage?.includes('registrationNumber')) {
        setError('registrationNumber', { type: 'manual', message: 'Registration number already exists' });
      } else {
        toast.error(error.backendMessage || 'Failed to add vehicle');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vehicleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle updated successfully');
      closeModal();
    },
    onError: (error) => {
      if (error.response?.status === 409 || error.backendMessage?.includes('registrationNumber')) {
        setError('registrationNumber', { type: 'manual', message: 'Registration number already exists' });
      } else {
        toast.error(error.backendMessage || 'Failed to update vehicle');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle deleted successfully');
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to delete vehicle');
    },
  });

  const onSubmit = (data) => {
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setValue('registrationNumber', vehicle.registrationNumber);
      setValue('name', vehicle.name);
      setValue('type', vehicle.type);
      setValue('maxLoadCapacity', vehicle.maxLoadCapacity);
      setValue('odometer', vehicle.odometer);
      setValue('acquisitionCost', vehicle.acquisitionCost);
      setValue('status', vehicle.status);
      setValue('region', vehicle.region || '');
    } else {
      setEditingVehicle(null);
      reset({
        registrationNumber: '',
        name: '',
        type: 'Truck',
        maxLoadCapacity: 0.1,
        odometer: 0,
        acquisitionCost: 0,
        status: 'AVAILABLE',
        region: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    reset();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  const vehicles = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className="p-6 bg-[#F7F7F8] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Vehicles</h1>
        {canModify && (
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </button>
        )}
      </div>

      <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E5E7] text-sm font-medium text-[#6B6B70]">
                <th className="py-4 px-6">Registration</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Max Load (kg)</th>
                <th className="py-4 px-6">Status</th>
                {canModify && <th className="py-4 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm text-[#1C1C1E]">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#6B6B70]">Loading...</td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#6B6B70]">No vehicles found</td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-[#E5E5E7] last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">{vehicle.registrationNumber}</td>
                    <td className="py-4 px-6">{vehicle.name}</td>
                    <td className="py-4 px-6">{vehicle.type}</td>
                    <td className="py-4 px-6">{vehicle.maxLoadCapacity}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        vehicle.status === 'IN_SHOP' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    {canModify && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => openModal(vehicle)}
                            className="text-[#D97706] hover:text-amber-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Registration Number</label>
                <input
                  {...register('registrationNumber')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  placeholder="e.g. ABC-1234"
                />
                {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Name</label>
                  <input
                    {...register('name')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                    placeholder="e.g. Delivery Truck 1"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Type</label>
                  <select
                    {...register('type')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                  {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Max Load (kg)</label>
                  <input
                    {...register('maxLoadCapacity', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  />
                  {errors.maxLoadCapacity && <p className="mt-1 text-sm text-red-600">{errors.maxLoadCapacity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Odometer</label>
                  <input
                    {...register('odometer', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  />
                  {errors.odometer && <p className="mt-1 text-sm text-red-600">{errors.odometer.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Acquisition Cost</label>
                  <input
                    {...register('acquisitionCost', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  />
                  {errors.acquisitionCost && <p className="mt-1 text-sm text-red-600">{errors.acquisitionCost.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Region</label>
                  <input
                    {...register('region')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm disabled:opacity-50"
                >
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
