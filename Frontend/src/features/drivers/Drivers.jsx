import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { driverApi } from '../../api/driverApi';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Edit2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseCategory: z.string().min(1, 'Category is required'),
  licenseExpiry: z.string().min(1, 'Expiry date is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email')
});

export default function Drivers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driverApi.getAll().then(res => res.data)
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '', lastName: '', licenseNumber: '', licenseCategory: '',
      licenseExpiry: '', phone: '', email: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: driverApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver created successfully');
      handleCloseModal();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to create driver')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driverApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
      handleCloseModal();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to update driver')
  });

  const onSubmit = (data) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (driver) => {
    setEditingId(driver.id);
    form.reset({
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiry: driver.licenseExpiry.substring(0, 10),
      phone: driver.phone,
      email: driver.email
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.reset();
  };

  const getExpiryBadge = (dateString) => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-black text-white rounded-full">Expired</span>;
    } else if (diffDays <= 30) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-neutral-200 text-black rounded-full">Expiring</span>;
    }
    return new Date(dateString).toLocaleDateString();
  };

  const getSafetyScoreBar = (score) => {
    const numScore = parseFloat(score) || 0;
    const percent = Math.min(100, Math.max(0, numScore));
    return (
      <div className="flex flex-col gap-1 w-24">
        <span className="text-sm font-medium text-black">{numScore.toFixed(1)}/100</span>
        <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div className="h-full bg-black rounded-full" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    );
  };

  const columns = [
    { header: 'Name', accessorKey: 'fullName', cell: (info, row) => <div className="font-medium text-black">{row.firstName} {row.lastName}</div> },
    { header: 'License#', accessorKey: 'licenseNumber' },
    { header: 'Category', accessorKey: 'licenseCategory' },
    { header: 'License Expiry', accessorKey: 'licenseExpiry', cell: (info) => getExpiryBadge(info) },
    { header: 'Contact', accessorKey: 'phone' },
    { header: 'Safety Score', accessorKey: 'safetyScore', cell: (info) => getSafetyScoreBar(info) },
    { header: 'Status', accessorKey: 'status', cell: (info) => <StatusBadge type="driver" status={info} /> },
    {
      header: 'Actions',
      cell: (_, row) => (
        <button onClick={() => handleEdit(row)} className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Drivers</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Add Driver
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <DataTable data={drivers} columns={columns} isLoading={isLoading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
              <input {...form.register('firstName')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.firstName && <p className="text-xs text-red-600 mt-1">{form.formState.errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
              <input {...form.register('lastName')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.lastName && <p className="text-xs text-red-600 mt-1">{form.formState.errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">License Number</label>
              <input {...form.register('licenseNumber')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.licenseNumber && <p className="text-xs text-red-600 mt-1">{form.formState.errors.licenseNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <input {...form.register('licenseCategory')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.licenseCategory && <p className="text-xs text-red-600 mt-1">{form.formState.errors.licenseCategory.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date</label>
              <input type="date" {...form.register('licenseExpiry')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.licenseExpiry && <p className="text-xs text-red-600 mt-1">{form.formState.errors.licenseExpiry.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
              <input {...form.register('phone')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.phone && <p className="text-xs text-red-600 mt-1">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input {...form.register('email')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.email && <p className="text-xs text-red-600 mt-1">{form.formState.errors.email.message}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">Save Driver</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
