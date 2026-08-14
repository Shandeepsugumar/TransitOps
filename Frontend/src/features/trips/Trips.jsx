import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, Navigation, Ban } from 'lucide-react';
import { tripApi } from '../../api/tripApi';
import { vehicleApi } from '../../api/vehicleApi';
import { driverApi } from '../../api/driverApi';
import { useAuthStore } from '../../store/authStore';

const tripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  source: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargoWeight: z.number().min(0.1, 'Weight must be > 0'),
  plannedDistance: z.number().min(0.1, 'Distance must be > 0'),
  revenue: z.number().min(0).optional(),
});

const completeSchema = z.object({
  finalOdometer: z.number().min(0.1, 'Must be > 0'),
  fuelConsumed: z.number().min(0.1, 'Must be > 0'),
});

export default function Trips() {
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const canModify = role === 'FLEET_MANAGER' || role === 'DRIVER';
  const isFleetManager = role === 'FLEET_MANAGER';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completeTripId, setCompleteTripId] = useState(null);

  const { data: tripsData, isLoading: isLoadingTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll(),
  });
  
  const { data: availableVehicles } = useQuery({
    queryKey: ['availableVehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const { data: availableDrivers } = useQuery({
    queryKey: ['availableDrivers'],
    queryFn: () => driverApi.getAll({}),
  });

  const trips = Array.isArray(tripsData) ? tripsData : tripsData?.data || [];
  
  // Filter only available vehicles and drivers for the dropdowns
  const rawVehicles = Array.isArray(availableVehicles) ? availableVehicles : availableVehicles?.data || [];
  const vehicles = rawVehicles.filter(v => v.status === 'AVAILABLE');
  
  const rawDrivers = Array.isArray(availableDrivers) ? availableDrivers : availableDrivers?.data || [];
  const drivers = rawDrivers.filter(d => d.status === 'AVAILABLE');

  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate } } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      cargoWeight: 100,
      plannedDistance: 50,
      revenue: 0,
    }
  });

  const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete, formState: { errors: errorsComplete } } = useForm({
    resolver: zodResolver(completeSchema),
  });

  const createMutation = useMutation({
    mutationFn: tripApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created successfully');
      setIsCreateOpen(false);
      resetCreate();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to create trip'),
  });

  const dispatchMutation = useMutation({
    mutationFn: tripApi.dispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip dispatched');
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to dispatch trip'),
  });

  const completeMutation = useMutation({
    mutationFn: ({id, data}) => tripApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip completed');
      setCompleteTripId(null);
      resetComplete();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to complete trip'),
  });

  const cancelMutation = useMutation({
    mutationFn: tripApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip cancelled');
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to cancel trip'),
  });

  const onCreate = (data) => createMutation.mutate(data);
  const onComplete = (data) => completeMutation.mutate({ id: completeTripId, data });

  return (
    <div className="space-y-6 bg-[#F7F7F8] min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Trips</h1>
          <p className="text-[#6B6B70] mt-1">Manage active and past trips</p>
        </div>
        {canModify && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Trip
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
            <tr>
              <th className="p-4 font-medium">Route</th>
              <th className="p-4 font-medium">Vehicle / Driver</th>
              <th className="p-4 font-medium">Status</th>
              {canModify && <th className="p-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E7]">
            {isLoadingTrips ? (
              <tr><td colSpan={canModify ? 4 : 3} className="p-8 text-center text-[#6B6B70]">Loading...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan={canModify ? 4 : 3} className="p-8 text-center text-[#6B6B70]">No trips found.</td></tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4">
                    <div className="text-[#1C1C1E] font-medium">{trip.source}</div>
                    <div className="text-sm text-[#6B6B70]">to {trip.destination}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[#1C1C1E]">{trip.vehicle?.registrationNumber || `Vehicle ${trip.vehicleId}`}</div>
                    <div className="text-sm text-[#6B6B70]">{trip.driver?.name || `Driver ${trip.driverId}`}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      trip.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  {canModify && (
                    <td className="p-4 flex items-center justify-end gap-2">
                      {trip.status === 'PLANNED' && (
                        <>
                          <button
                            onClick={() => dispatchMutation.mutate(trip.id)}
                            className="px-3 py-1 bg-[#D97706] text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Navigation className="w-4 h-4" /> Dispatch
                          </button>
                          {isFleetManager && (
                            <button
                              onClick={() => cancelMutation.mutate(trip.id)}
                              className="px-3 py-1 bg-white border border-[#E5E5E7] text-[#1C1C1E] text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Ban className="w-4 h-4" /> Cancel
                            </button>
                          )}
                        </>
                      )}
                      {trip.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setCompleteTripId(trip.id)}
                          className="px-3 py-1 bg-[#16A34A] text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" /> Complete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-[#E5E5E7]">
            <div className="flex justify-between items-center p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Create New Trip</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form method="post" onSubmit={handleSubmitCreate(onCreate)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Vehicle</label>
                  <select
                    {...registerCreate('vehicleId')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
                    ))}
                  </select>
                  {errorsCreate.vehicleId && <p className="text-red-500 text-xs mt-1">{errorsCreate.vehicleId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Driver</label>
                  <select
                    {...registerCreate('driverId')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  >
                    <option value="">Select a driver</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errorsCreate.driverId && <p className="text-red-500 text-xs mt-1">{errorsCreate.driverId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Origin</label>
                  <input
                    {...registerCreate('source')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                    placeholder="Starting point"
                  />
                  {errorsCreate.source && <p className="text-red-500 text-xs mt-1">{errorsCreate.source.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Destination</label>
                  <input
                    {...registerCreate('destination')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                    placeholder="Ending point"
                  />
                  {errorsCreate.destination && <p className="text-red-500 text-xs mt-1">{errorsCreate.destination.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Cargo Weight</label>
                  <input
                    {...registerCreate('cargoWeight', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errorsCreate.cargoWeight && <p className="text-red-500 text-xs mt-1">{errorsCreate.cargoWeight.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Planned Distance</label>
                  <input
                    {...registerCreate('plannedDistance', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errorsCreate.plannedDistance && <p className="text-red-500 text-xs mt-1">{errorsCreate.plannedDistance.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Revenue ($)</label>
                  <input
                    {...registerCreate('revenue', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errorsCreate.revenue && <p className="text-red-500 text-xs mt-1">{errorsCreate.revenue.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {completeTripId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-[#E5E5E7]">
            <div className="flex justify-between items-center p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Complete Trip</h2>
              <button onClick={() => setCompleteTripId(null)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form method="post" onSubmit={handleSubmitComplete(onComplete)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Final Odometer</label>
                <input
                  type="number"
                  step="0.1"
                  {...registerComplete('finalOdometer', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.0"
                />
                {errorsComplete.finalOdometer && <p className="text-red-500 text-xs mt-1">{errorsComplete.finalOdometer.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Fuel Consumed (L/Gal)</label>
                <input
                  type="number"
                  step="0.1"
                  {...registerComplete('fuelConsumed', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.0"
                />
                {errorsComplete.fuelConsumed && <p className="text-red-500 text-xs mt-1">{errorsComplete.fuelConsumed.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setCompleteTripId(null)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeMutation.isPending}
                  className="px-4 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                >
                  {completeMutation.isPending ? 'Completing...' : 'Complete Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
