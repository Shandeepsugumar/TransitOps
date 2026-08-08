import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fuelExpenseApi } from '../../api/fuelExpenseApi';
import { vehicleApi } from '../../api/vehicleApi';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const fuelSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  liters: z.coerce.number().min(0.1, 'Must be > 0'),
  cost: z.coerce.number().min(0, 'Must be >= 0'),
  date: z.string().min(1, 'Date is required')
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  expenseType: z.string().min(1, 'Type is required'),
  amount: z.coerce.number().min(0, 'Must be >= 0'),
  notes: z.string().optional(),
  date: z.string().min(1, 'Date is required')
});

export default function FuelExpenses() {
  const queryClient = useQueryClient();
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll().then(res => res.data)
  });

  const { data: fuelLogs = [], isLoading: loadingFuel } = useQuery({
    queryKey: ['fuelLogs', selectedVehicle],
    queryFn: () => fuelExpenseApi.getFuelLogs(selectedVehicle ? { vehicleId: selectedVehicle } : {}).then(res => res.data)
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses', selectedVehicle],
    queryFn: () => fuelExpenseApi.getExpenses(selectedVehicle ? { vehicleId: selectedVehicle } : {}).then(res => res.data)
  });

  const fuelForm = useForm({
    resolver: zodResolver(fuelSchema),
    defaultValues: { vehicleId: '', liters: 0, cost: 0, date: '' }
  });

  const expenseForm = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { vehicleId: '', expenseType: '', amount: 0, notes: '', date: '' }
  });

  const logFuelMutation = useMutation({
    mutationFn: fuelExpenseApi.createFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs'] });
      toast.success('Fuel log added');
      setIsFuelModalOpen(false);
      fuelForm.reset();
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to add fuel log')
  });

  const logExpenseMutation = useMutation({
    mutationFn: fuelExpenseApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added');
      setIsExpenseModalOpen(false);
      expenseForm.reset();
    },
    onError: (err) => toast.error(err.backendMessage || 'Failed to add expense')
  });

  const fuelCols = [
    { header: 'Date', cell: (_, row) => new Date(row.date).toLocaleDateString() },
    { header: 'Vehicle', cell: (_, row) => row.vehicle?.registrationNumber || '-' },
    { header: 'Liters', cell: (_, row) => `${row.liters} L` },
    { header: 'Cost', cell: (_, row) => `$${row.cost.toFixed(2)}` }
  ];

  const expenseCols = [
    { header: 'Date', cell: (_, row) => new Date(row.date).toLocaleDateString() },
    { header: 'Vehicle', cell: (_, row) => row.vehicle?.registrationNumber || '-' },
    { header: 'Type', accessorKey: 'expenseType' },
    { header: 'Amount', cell: (_, row) => `$${row.amount.toFixed(2)}` },
    { header: 'Notes', accessorKey: 'notes' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Fuel & Expenses</h1>
        <div className="w-64">
          <select 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none bg-white text-black"
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-black">Fuel Logs</h2>
          <button onClick={() => setIsFuelModalOpen(true)} className="flex items-center px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors">
            <Plus className="w-4 h-4 mr-1" /> Add Fuel Log
          </button>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <DataTable data={fuelLogs} columns={fuelCols} isLoading={loadingFuel} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-black">Other Expenses</h2>
          <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors">
            <Plus className="w-4 h-4 mr-1" /> Add Expense
          </button>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <DataTable data={expenses} columns={expenseCols} isLoading={loadingExpenses} />
        </div>
      </div>

      {/* Fuel Log Modal */}
      <Modal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} title="Log Fuel">
        <form onSubmit={fuelForm.handleSubmit((d) => logFuelMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle</label>
            <select {...fuelForm.register('vehicleId')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none bg-white">
              <option value="">Select a vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Liters</label>
              <input type="number" step="0.1" {...fuelForm.register('liters')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cost ($)</label>
              <input type="number" step="0.01" {...fuelForm.register('cost')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
            <input type="date" {...fuelForm.register('date')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => setIsFuelModalOpen(false)} className="px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg hover:bg-neutral-50">Cancel</button>
            <button type="submit" disabled={logFuelMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50">Save</button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Expense">
        <form onSubmit={expenseForm.handleSubmit((d) => logExpenseMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle</label>
            <select {...expenseForm.register('vehicleId')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none bg-white">
              <option value="">Select a vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Expense Type</label>
            <input {...expenseForm.register('expenseType')} placeholder="e.g. Tolls, Washing" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Amount ($)</label>
              <input type="number" step="0.01" {...expenseForm.register('amount')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
              <input type="date" {...expenseForm.register('date')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (Optional)</label>
            <input {...expenseForm.register('notes')} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none" />
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
            <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg hover:bg-neutral-50">Cancel</button>
            <button type="submit" disabled={logExpenseMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
