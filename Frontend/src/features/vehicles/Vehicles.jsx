import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Edit, Trash2, Plus } from 'lucide-react';
import { vehicleApi } from '../../api/vehicleApi';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Truck', 'Van', 'Trailer'], { required_error: 'Type is required' }),
  maxLoadCapacity: z.number().min(0.1, 'Must be positive'),
  odometer: z.number().min(0, 'Must be non-negative'),
  acquisitionCost: z.number().min(0.1, 'Must be positive'),
  status: z.enum(['AVAILABLE', 'IN_SHOP', 'RETIRED']),
  region: z.string().optional(),
});

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'AVAILABLE',
      type: 'Truck',
      odometer: 0,
      region: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle added successfully');
      closeModal();
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        setError('registrationNumber', { message: error.backendMessage || 'Registration already exists' });
      } else {
        toast.error(error.backendMessage || 'Failed to add vehicle');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vehicleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated successfully');
      closeModal();
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        setError('registrationNumber', { message: error.backendMessage || 'Registration already exists' });
      } else {
        toast.error(error.backendMessage || 'Failed to update vehicle');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle deleted successfully');
      setVehicleToDelete(null);
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to delete vehicle');
      setVehicleToDelete(null);
    },
  });

  const openAddModal = () => {
    setEditingVehicle(null);
    reset({
      registrationNumber: '',
      name: '',
      type: 'Truck',
      maxLoadCapacity: 0,
      odometer: 0,
      acquisitionCost: 0,
      status: 'AVAILABLE',
      region: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    reset(vehicle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { header: 'Registration', accessorKey: 'registrationNumber' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Max Load (kg)', accessorKey: 'maxLoadCapacity' },
    { header: 'Odometer (km)', accessorKey: 'odometer' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} type="vehicle" />,
    },
    { header: 'Region', accessorKey: 'region' },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(row.original)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => setVehicleToDelete(row.original)}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Delete/Retire"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Registry</h1>
          <p className="text-gray-500 mt-1">Manage your fleet of vehicles</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading vehicles...</div>
        ) : (
          <DataTable columns={columns} data={vehicles} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input
                {...register('registrationNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="e.g. AB-123-CD"
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name / Identifier</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              >
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Trailer">Trailer</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_SHOP">In Shop</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Load (kg)</label>
              <input
                type="number"
                step="0.1"
                {...register('maxLoadCapacity', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.maxLoadCapacity && (
                <p className="text-red-500 text-xs mt-1">{errors.maxLoadCapacity.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
              <input
                type="number"
                {...register('odometer', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.odometer && (
                <p className="text-red-500 text-xs mt-1">{errors.odometer.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acquisition Cost</label>
              <input
                type="number"
                step="0.1"
                {...register('acquisitionCost', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.acquisitionCost && (
                <p className="text-red-500 text-xs mt-1">{errors.acquisitionCost.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region (Optional)</label>
            <input
              {...register('region')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {editingVehicle ? 'Update' : 'Save'} Vehicle
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!vehicleToDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${vehicleToDelete?.registrationNumber}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteMutation.mutate(vehicleToDelete?.id)}
        onCancel={() => setVehicleToDelete(null)}
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
