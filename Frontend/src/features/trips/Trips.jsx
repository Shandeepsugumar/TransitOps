import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, Check, X, Send, Play } from 'lucide-react';
import { tripApi } from '../../api/tripApi';
import { vehicleApi } from '../../api/vehicleApi';
import { driverApi } from '../../api/driverApi';

const StatusBadge = ({ status }) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    DISPATCHED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const tripSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.number().min(1, 'Vehicle is required'),
  driverId: z.number().min(1, 'Driver is required'),
  cargoWeight: z.number().min(0.1, 'Cargo weight must be positive'),
  plannedDistance: z.number().min(0.1, 'Planned distance must be positive'),
});

const completeTripSchema = z.object({
  finalOdometer: z.number().min(0, 'Final odometer must be positive'),
  fuelConsumed: z.number().min(0.1, 'Fuel consumed must be positive'),
});

export default function Trips() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [completeModalTripId, setCompleteModalTripId] = useState(null);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll(),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-available'],
    queryFn: () => vehicleApi.getAvailable(),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers-available'],
    queryFn: () => driverApi.getAvailable(),
  });

  const createMutation = useMutation({
    mutationFn: tripApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to create trip'),
  });

  const dispatchMutation = useMutation({
    mutationFn: (id) => tripApi.dispatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-available'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-available'] });
      toast.success('Trip dispatched successfully');
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to dispatch trip'),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }) => tripApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-available'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-available'] });
      toast.success('Trip completed successfully');
      setCompleteModalTripId(null);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to complete trip'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => tripApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-available'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-available'] });
      toast.success('Trip cancelled successfully');
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to cancel trip'),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(tripSchema),
  });

  const {
    register: registerComplete,
    handleSubmit: handleCompleteSubmit,
    reset: resetComplete,
  } = useForm({
    resolver: zodResolver(completeTripSchema),
  });

  const selectedVehicleId = watch('vehicleId');
  const cargoWeight = watch('cargoWeight');
  const selectedVehicle = vehicles.find((v) => v.id === Number(selectedVehicleId));
  const capacityError = selectedVehicle && cargoWeight > selectedVehicle.maxLoadCapacity;

  const onSubmit = (data) => {
    if (capacityError) return;
    createMutation.mutate(data);
  };

  const onCompleteSubmit = (data) => {
    completeMutation.mutate({ id: completeModalTripId, data });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trip Management</h1>
        <button
          onClick={() => {
            reset();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Trip
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading trips...</td>
              </tr>
            ) : trips.map((trip) => (
              <tr key={trip.id}>
                <td className="px-6 py-4 whitespace-nowrap">{trip.source}</td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.vehicleRegistration || trip.registrationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.driverName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.cargoWeight} kg</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={trip.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {trip.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => dispatchMutation.mutate(trip.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Dispatch"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this trip?')) {
                            cancelMutation.mutate(trip.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {trip.status === 'DISPATCHED' && (
                    <>
                      <button
                        onClick={() => {
                          resetComplete();
                          setCompleteModalTripId(trip.id);
                        }}
                        className="text-green-600 hover:text-green-900 mr-4"
                        title="Complete"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this trip?')) {
                            cancelMutation.mutate(trip.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Trip</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <input {...register('source')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <input {...register('destination')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select {...register('vehicleId', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} (Max: {v.maxLoadCapacity}kg)</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver</label>
                <select {...register('driverId', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.fullName}</option>
                  ))}
                </select>
                {errors.driverId && <p className="text-red-500 text-xs mt-1">{errors.driverId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cargo Weight (kg)</label>
                <input type="number" step="0.1" {...register('cargoWeight', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.cargoWeight && <p className="text-red-500 text-xs mt-1">{errors.cargoWeight.message}</p>}
                {capacityError && <p className="text-red-500 text-xs mt-1">Exceeds vehicle max capacity!</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Planned Distance (km)</label>
                <input type="number" step="0.1" {...register('plannedDistance', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {errors.plannedDistance && <p className="text-red-500 text-xs mt-1">{errors.plannedDistance.message}</p>}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={capacityError || createMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {completeModalTripId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Complete Trip</h2>
            <form onSubmit={handleCompleteSubmit(onCompleteSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Final Odometer</label>
                <input type="number" {...registerComplete('finalOdometer', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {/* @ts-ignore */}
                {/* errors Complete Trip Schema validation check */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuel Consumed (L)</label>
                <input type="number" step="0.1" {...registerComplete('fuelConsumed', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setCompleteModalTripId(null)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
