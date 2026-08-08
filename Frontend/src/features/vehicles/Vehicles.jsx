import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { vehicleApi } from '../../api/vehicleApi';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  capacity: z.number().min(1),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']),
});

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll({ page: 0, size: 100 }),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'ACTIVE',
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
      toast.error(error.backendMessage || 'Failed to add vehicle');
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
      toast.error(error.backendMessage || 'Failed to update vehicle');
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
      setValue('make', vehicle.make);
      setValue('model', vehicle.model);
      setValue('year', vehicle.year);
      setValue('capacity', vehicle.capacity);
      setValue('status', vehicle.status);
    } else {
      setEditingVehicle(null);
      reset({
        registrationNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        capacity: 1,
        status: 'ACTIVE'
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

  const vehicles = data?.content || [];

  return (
    <div className="p-6 bg-[#F7F7F8] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Vehicles</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </button>
      </div>

      <div className="bg-white border border-[#E5E5E7] shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E5E7] text-sm font-medium text-[#6B6B70]">
                <th className="py-4 px-6">Registration</th>
                <th className="py-4 px-6">Make & Model</th>
                <th className="py-4 px-6">Year</th>
                <th className="py-4 px-6">Capacity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
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
                    <td className="py-4 px-6">{vehicle.make} {vehicle.model}</td>
                    <td className="py-4 px-6">{vehicle.year}</td>
                    <td className="py-4 px-6">{vehicle.capacity}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        vehicle.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
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
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Make</label>
                  <input
                    {...register('make')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                    placeholder="e.g. Ford"
                  />
                  {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Model</label>
                  <input
                    {...register('model')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                    placeholder="e.g. Transit"
                  />
                  {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Year</label>
                  <input
                    {...register('year', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Capacity</label>
                  <input
                    {...register('capacity', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                  />
                  {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
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
