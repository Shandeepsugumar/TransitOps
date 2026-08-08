import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { tripApi } from '../../api/tripApi';
import { vehicleApi } from '../../api/vehicleApi';
import { driverApi } from '../../api/driverApi';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Check, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const createSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoWeight: z.coerce.number().min(0, 'Must be positive'),
  plannedDistance: z.coerce.number().min(0, 'Must be positive')
});

const completeSchema = z.object({
  finalOdometer: z.coerce.number().min(0, 'Must be positive'),
  fuelConsumed: z.coerce.number().min(0, 'Must be positive')
});

export default function Trips() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll().then(res => res.data)
  });

  const { data: availableVehicles = [] } = useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: () => vehicleApi.getAvailable().then(res => res.data)
  });

  const { data: availableDrivers = [] } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => driverApi.getAvailable().then(res => res.data)
  });

  const createForm = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: 0, plannedDistance: 0 }
  });

  const completeForm = useForm({
    resolver: zodResolver(completeSchema),
    defaultValues: { finalOdometer: 0, fuelConsumed: 0 }
  });

  const createMutation = useMutation({
    mutationFn: tripApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Trip created successfully');
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to create trip')
  });

  const dispatchMutation = useMutation({
    mutationFn: tripApi.dispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip dispatched successfully');
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to dispatch trip')
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }) => tripApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Trip completed successfully');
      setIsCompleteOpen(false);
      completeForm.reset();
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to complete trip')
  });

  const cancelMutation = useMutation({
    mutationFn: tripApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Trip cancelled successfully');
      setIsCancelOpen(false);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to cancel trip')
  });

  const onCreateSubmit = (data) => {
    const vehicle = availableVehicles.find(v => v.id.toString() === data.vehicleId.toString());
    if (vehicle && data.cargoWeight > vehicle.maxLoadCapacity) {
      toast.error(`Cargo weight exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`);
      return;
    }
    createMutation.mutate(data);
  };

  const onCompleteSubmit = (data) => {
    if (selectedTrip) {
      completeMutation.mutate({ id: selectedTrip.id, data });
    }
  };

  const columns = [
    { header: 'Source', accessorKey: 'source' },
    { header: 'Destination', accessorKey: 'destination' },
    { header: 'Vehicle', cell: (_, row) => row.vehicle?.registrationNumber || '-' },
    { header: 'Driver', cell: (_, row) => row.driver ? `${row.driver.firstName} ${row.driver.lastName}` : '-' },
    { header: 'Cargo (kg)', accessorKey: 'cargoWeight' },
    { header: 'Status', accessorKey: 'status', cell: (info) => <StatusBadge type="trip" status={info} /> },
    {
      header: 'Actions',
      cell: (_, row) => {
        const isDimmed = row.status === 'COMPLETED' || row.status === 'CANCELLED';
        if (isDimmed) return null;

        return (
          <div className="flex items-center gap-2">
            {row.status === 'DRAFT' && (
              <>
                <button onClick={() => dispatchMutation.mutate(row.id)} className="p-1.5 text-xs bg-black text-white rounded-md hover:bg-neutral-800 transition-colors flex items-center">
                  <Send className="w-3 h-3 mr-1" /> Dispatch
                </button>
                <button onClick={() => { setSelectedTrip(row); setIsCancelOpen(true); }} className="p-1.5 text-xs border border-neutral-300 text-black rounded-md hover:bg-neutral-100 transition-colors flex items-center">
                  <X className="w-3 h-3 mr-1" /> Cancel
                </button>
              </>
            )}
            {row.status === 'DISPATCHED' && (
              <>
                <button onClick={() => { setSelectedTrip(row); setIsCompleteOpen(true); }} className="p-1.5 text-xs bg-black text-white rounded-md hover:bg-neutral-800 transition-colors flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Complete
                </button>
                <button onClick={() => { setSelectedTrip(row); setIsCancelOpen(true); }} className="p-1.5 text-xs border border-neutral-300 text-black rounded-md hover:bg-neutral-100 transition-colors flex items-center">
                  <X className="w-3 h-3 mr-1" /> Cancel
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Trips</h1>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Create Trip
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <DataTable 
          data={trips} 
          columns={columns} 
          isLoading={isLoading} 
          rowClassName={(row) => (row.status === 'COMPLETED' || row.status === 'CANCELLED') ? 'opacity-60 bg-neutral-50' : ''}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Trip">
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Source</label>
              <input {...createForm.register('source')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {createForm.formState.errors.source && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.source.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Destination</label>
              <input {...createForm.register('destination')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {createForm.formState.errors.destination && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.destination.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle</label>
              <select {...createForm.register('vehicleId')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none bg-white">
                <option value="">Select a vehicle</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} (Cap: {v.maxLoadCapacity}kg)</option>
                ))}
              </select>
              {createForm.formState.errors.vehicleId && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.vehicleId.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Driver</label>
              <select {...createForm.register('driverId')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none bg-white">
                <option value="">Select a driver</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                ))}
              </select>
              {createForm.formState.errors.driverId && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.driverId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cargo Weight (kg)</label>
              <input type="number" {...createForm.register('cargoWeight')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {createForm.formState.errors.cargoWeight && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.cargoWeight.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Planned Distance (km)</label>
              <input type="number" {...createForm.register('plannedDistance')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
              {createForm.formState.errors.plannedDistance && <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.plannedDistance.message}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">Create Trip</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)} title="Complete Trip">
        <form onSubmit={completeForm.handleSubmit(onCompleteSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Final Odometer</label>
            <input type="number" {...completeForm.register('finalOdometer')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
            {completeForm.formState.errors.finalOdometer && <p className="text-xs text-red-600 mt-1">{completeForm.formState.errors.finalOdometer.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Fuel Consumed (Liters)</label>
            <input type="number" {...completeForm.register('fuelConsumed')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
            {completeForm.formState.errors.fuelConsumed && <p className="text-xs text-red-600 mt-1">{completeForm.formState.errors.fuelConsumed.message}</p>}
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => setIsCompleteOpen(false)} className="px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={completeMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">Complete Trip</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={() => selectedTrip && cancelMutation.mutate(selectedTrip.id)}
        title="Cancel Trip"
        message="Are you sure you want to cancel this trip? This action cannot be undone."
        confirmText="Cancel Trip"
      />
    </div>
  );
}
