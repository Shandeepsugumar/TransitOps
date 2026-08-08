import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { driverApi } from '../../api/driverApi';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License Number is required'),
  licenseCategory: z.enum(['A', 'B', 'C', 'D', 'E'], { required_error: 'License Category is required' }),
  licenseExpiryDate: z.string().min(1, 'License Expiry Date is required'),
  contactNumber: z.string().min(1, 'Contact Number is required'),
  safetyScore: z.number().min(0).max(100).default(100),
  status: z.enum(['AVAILABLE', 'OFF_DUTY', 'SUSPENDED']),
});

export default function Drivers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driverApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      status: 'AVAILABLE',
      licenseCategory: 'C',
      safetyScore: 100,
    },
  });

  const createMutation = useMutation({
    mutationFn: driverApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver added successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to add driver');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driverApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.backendMessage || 'Failed to update driver');
    },
  });

  const openAddModal = () => {
    setEditingDriver(null);
    reset({
      name: '',
      licenseNumber: '',
      licenseCategory: 'C',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: 100,
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    reset({
      ...driver,
      licenseExpiryDate: driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
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

  const renderLicenseExpiry = (dateString) => {
    if (!dateString) return <span className="text-gray-400">N/A</span>;
    
    const expiryDate = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const isExpired = expiryDate < today;
    const isExpiringSoon = expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    
    return (
      <div className="flex items-center space-x-2">
        <span>{expiryDate.toLocaleDateString()}</span>
        {isExpired && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Expired
          </span>
        )}
        {isExpiringSoon && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Expiring Soon
          </span>
        )}
      </div>
    );
  };

  const renderSafetyScore = (score) => {
    let colorClass = 'bg-red-500';
    let textClass = 'text-red-700';
    if (score >= 80) {
      colorClass = 'bg-green-500';
      textClass = 'text-green-700';
    } else if (score >= 60) {
      colorClass = 'bg-yellow-500';
      textClass = 'text-yellow-700';
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`font-medium ${textClass}`}>{score}</span>
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  };

  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'License Number', accessorKey: 'licenseNumber' },
    { header: 'Category', accessorKey: 'licenseCategory' },
    {
      header: 'License Expiry',
      accessorKey: 'licenseExpiryDate',
      cell: ({ row }) => renderLicenseExpiry(row.original.licenseExpiryDate),
    },
    { header: 'Contact', accessorKey: 'contactNumber' },
    {
      header: 'Safety Score',
      accessorKey: 'safetyScore',
      cell: ({ row }) => renderSafetyScore(row.original.safetyScore),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} type="driver" />,
    },
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
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-500 mt-1">Manage drivers and monitor safety scores</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading drivers...</div>
        ) : (
          <DataTable columns={columns} data={drivers} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input
                {...register('licenseNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.licenseNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                {...register('contactNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
              <input
                type="date"
                {...register('licenseExpiryDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.licenseExpiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseExpiryDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Category</label>
              <select
                {...register('licenseCategory')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Safety Score (0-100)</label>
              <input
                type="number"
                {...register('safetyScore', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              {errors.safetyScore && (
                <p className="text-red-500 text-xs mt-1">{errors.safetyScore.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
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
              {editingDriver ? 'Update' : 'Save'} Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
