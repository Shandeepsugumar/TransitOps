import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { maintenanceApi } from '../../api/maintenanceApi';
import { vehicleApi } from '../../api/vehicleApi';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  maintenanceType: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  cost: z.coerce.number().min(0, 'Cost must be positive'),
  date: z.string().min(1, 'Date is required')
});

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.getAll().then(res => res.data)
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll().then(res => res.data)
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { vehicleId: '', maintenanceType: '', description: '', cost: 0, date: '' }
  });

  const createMutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Maintenance logged successfully');
      setIsModalOpen(false);
      form.reset();
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to log maintenance')
  });

  const closeMutation = useMutation({
    mutationFn: maintenanceApi.close,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Maintenance record closed');
      setIsCloseOpen(false);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to close record')
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const columns = [
    { header: 'Date', cell: (_, row) => new Date(row.date).toLocaleDateString() },
    { header: 'Vehicle', cell: (_, row) => row.vehicle?.registrationNumber || '-' },
    { header: 'Type', accessorKey: 'maintenanceType' },
    { header: 'Cost ($)', cell: (_, row) => `$${row.cost.toFixed(2)}` },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Status', accessorKey: 'status', cell: (info) => <StatusBadge type="maintenance" status={info} /> },
    {
      header: 'Actions',
      cell: (_, row) => row.status === 'ACTIVE' ? (
        <button 
          onClick={() => { setSelectedRecord(row); setIsCloseOpen(true); }}
          className="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-neutral-800 transition-colors flex items-center"
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Close
        </button>
      ) : null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Maintenance</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Log Maintenance
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <DataTable data={records} columns={columns} isLoading={isLoading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Maintenance">
        <div className="mb-4 p-3 bg-neutral-100 border border-neutral-300 rounded-lg flex items-start text-black">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />
          <p className="text-sm">This will set the vehicle status to <strong>IN_SHOP</strong> and make it unavailable for new trips until the maintenance record is closed.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle</label>
            <select {...form.register('vehicleId')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none bg-white">
              <option value="">Select a vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
            {form.formState.errors.vehicleId && <p className="text-xs text-red-600 mt-1">{form.formState.errors.vehicleId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Maintenance Type</label>
            <input {...form.register('maintenanceType')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" placeholder="e.g., Oil Change, Brake Replacement" />
            {form.formState.errors.maintenanceType && <p className="text-xs text-red-600 mt-1">{form.formState.errors.maintenanceType.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cost ($)</label>
              <input type="number" step="0.01" {...form.register('cost')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.cost && <p className="text-xs text-red-600 mt-1">{form.formState.errors.cost.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
              <input type="date" {...form.register('date')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {form.formState.errors.date && <p className="text-xs text-red-600 mt-1">{form.formState.errors.date.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea {...form.register('description')} rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none resize-none"></textarea>
            {form.formState.errors.description && <p className="text-xs text-red-600 mt-1">{form.formState.errors.description.message}</p>}
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">Log Maintenance</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        onConfirm={() => selectedRecord && closeMutation.mutate(selectedRecord.id)}
        title="Close Maintenance Record"
        message="Are you sure you want to close this record? The vehicle status will be returned to AVAILABLE."
        confirmText="Close Record"
      />
    </div>
  );
}
