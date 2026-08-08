import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { fuelExpenseApi } from '../../api/fuelExpenseApi';
import { vehicleApi } from '../../api/vehicleApi';

const fuelSchema = z.object({
  vehicleId: z.number().min(1, 'Vehicle is required'),
  liters: z.number().min(0.1, 'Liters must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  date: z.string().min(1, 'Date is required'),
});

const expenseSchema = z.object({
  vehicleId: z.number().min(1, 'Vehicle is required'),
  type: z.enum(['TOLL', 'MAINTENANCE', 'OTHER']),
  amount: z.number().min(0, 'Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export default function FuelExpenses() {
  const queryClient = useQueryClient();
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const queryParams = selectedVehicleId ? { vehicleId: Number(selectedVehicleId) } : {};

  const { data: fuelLogs = [], isLoading: isLoadingFuel } = useQuery({
    queryKey: ['fuel-logs', selectedVehicleId],
    queryFn: () => fuelExpenseApi.getFuelLogs(queryParams),
  });

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses', selectedVehicleId],
    queryFn: () => fuelExpenseApi.getExpenses(queryParams),
  });

  const fuelMutation = useMutation({
    mutationFn: fuelExpenseApi.createFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      toast.success('Fuel log added successfully');
      setIsFuelModalOpen(false);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to add fuel log'),
  });

  const expenseMutation = useMutation({
    mutationFn: fuelExpenseApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added successfully');
      setIsExpenseModalOpen(false);
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to add expense'),
  });

  const {
    register: registerFuel,
    handleSubmit: handleFuelSubmit,
    formState: { errors: fuelErrors },
    reset: resetFuel,
  } = useForm({
    resolver: zodResolver(fuelSchema),
  });

  const {
    register: registerExpense,
    handleSubmit: handleExpenseSubmit,
    formState: { errors: expenseErrors },
    reset: resetExpense,
  } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fuel & Expenses</h1>
        <div className="w-64">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Logs Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Fuel Logs</h2>
            <button
              onClick={() => {
                resetFuel({ vehicleId: selectedVehicleId ? Number(selectedVehicleId) : undefined });
                setIsFuelModalOpen(true);
              }}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Fuel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Liters</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingFuel ? (
                  <tr><td colSpan="4" className="px-4 py-2 text-center text-gray-500">Loading...</td></tr>
                ) : fuelLogs.map(log => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{log.vehicleRegistration || log.registrationNumber}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{log.liters.toFixed(2)} L</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">${log.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Expenses</h2>
            <button
              onClick={() => {
                resetExpense({ vehicleId: selectedVehicleId ? Number(selectedVehicleId) : undefined });
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Expense
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingExpenses ? (
                  <tr><td colSpan="5" className="px-4 py-2 text-center text-gray-500">Loading...</td></tr>
                ) : expenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{exp.vehicleRegistration || exp.registrationNumber}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{exp.type}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">${exp.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">{exp.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Fuel Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Fuel Log</h2>
            <form onSubmit={handleFuelSubmit(data => fuelMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select {...registerFuel('vehicleId', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
                {fuelErrors.vehicleId && <p className="text-red-500 text-xs mt-1">{fuelErrors.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Liters</label>
                <input type="number" step="0.1" {...registerFuel('liters', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {fuelErrors.liters && <p className="text-red-500 text-xs mt-1">{fuelErrors.liters.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
                <input type="number" step="0.01" {...registerFuel('cost', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {fuelErrors.cost && <p className="text-red-500 text-xs mt-1">{fuelErrors.cost.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" {...registerFuel('date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {fuelErrors.date && <p className="text-red-500 text-xs mt-1">{fuelErrors.date.message}</p>}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsFuelModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={fuelMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {fuelMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleExpenseSubmit(data => expenseMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select {...registerExpense('vehicleId', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
                {expenseErrors.vehicleId && <p className="text-red-500 text-xs mt-1">{expenseErrors.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select {...registerExpense('type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Select Type</option>
                  <option value="TOLL">Toll</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OTHER">Other</option>
                </select>
                {expenseErrors.type && <p className="text-red-500 text-xs mt-1">{expenseErrors.type.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input type="number" step="0.01" {...registerExpense('amount', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {expenseErrors.amount && <p className="text-red-500 text-xs mt-1">{expenseErrors.amount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" {...registerExpense('date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                {expenseErrors.date && <p className="text-red-500 text-xs mt-1">{expenseErrors.date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea {...registerExpense('notes')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={expenseMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {expenseMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
