import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, Fuel, DollarSign } from 'lucide-react';
import { fuelExpenseApi } from '../../api/fuelExpenseApi';
import { vehicleApi } from '../../api/vehicleApi';

const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  liters: z.number().min(0.1, 'Liters must be > 0'),
  cost: z.number().min(0, 'Cost must be positive'),
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
});

export default function FuelExpenses() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'expenses'
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { data: fuelLogsData, isLoading: isLoadingFuel } = useQuery({
    queryKey: ['fuelLogs'],
    queryFn: () => fuelExpenseApi.getFuelLogs(),
  });

  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => fuelExpenseApi.getExpenses(),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  const fuelLogs = Array.isArray(fuelLogsData) ? fuelLogsData : fuelLogsData?.data || [];
  const expenses = Array.isArray(expensesData) ? expensesData : expensesData?.data || [];
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || [];

  const { register: regFuel, handleSubmit: handleFuel, reset: resetFuel, formState: { errors: errFuel } } = useForm({
    resolver: zodResolver(fuelLogSchema),
  });

  const { register: regExp, handleSubmit: handleExp, reset: resetExp, formState: { errors: errExp } } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  const fuelMutation = useMutation({
    mutationFn: fuelExpenseApi.createFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs'] });
      toast.success('Fuel log added');
      setIsFuelModalOpen(false);
      resetFuel();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to add fuel log'),
  });

  const expenseMutation = useMutation({
    mutationFn: fuelExpenseApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added');
      setIsExpenseModalOpen(false);
      resetExp();
    },
    onError: (error) => toast.error(error.backendMessage || 'Failed to add expense'),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Fuel & Expenses</h1>
          <p className="text-[#6B6B70] mt-1">Track fuel consumption and operational costs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </button>
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Fuel Log
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[#E5E5E7] pb-1">
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'fuel' ? 'border-b-2 border-[#D97706] text-[#D97706]' : 'text-[#6B6B70] hover:text-[#1C1C1E]'}`}
          onClick={() => setActiveTab('fuel')}
        >
          <div className="flex items-center gap-2"><Fuel className="w-4 h-4" /> Fuel Logs</div>
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'expenses' ? 'border-b-2 border-[#D97706] text-[#D97706]' : 'text-[#6B6B70] hover:text-[#1C1C1E]'}`}
          onClick={() => setActiveTab('expenses')}
        >
          <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Other Expenses</div>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm overflow-hidden">
        {activeTab === 'fuel' && (
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Volume (L)</th>
                <th className="p-4 font-medium">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E7]">
              {isLoadingFuel ? (
                <tr><td colSpan="4" className="p-4 text-center text-[#6B6B70]">Loading...</td></tr>
              ) : fuelLogs.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-[#6B6B70]">No fuel logs found.</td></tr>
              ) : (
                fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-[#1C1C1E]">{new Date(log.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="p-4 text-[#6B6B70]">{log.vehicle?.licensePlate || log.vehicleId}</td>
                    <td className="p-4 text-[#1C1C1E]">{log.liters} L</td>
                    <td className="p-4 text-[#1C1C1E]">${log.cost?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'expenses' && (
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E7]">
              {isLoadingExpenses ? (
                <tr><td colSpan="4" className="p-4 text-center text-[#6B6B70]">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-[#6B6B70]">No expenses found.</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-[#1C1C1E]">{new Date(exp.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="p-4 text-[#6B6B70]">{exp.vehicle?.licensePlate || exp.vehicleId}</td>
                    <td className="p-4 text-[#6B6B70]">{exp.category}</td>
                    <td className="p-4 text-[#1C1C1E]">${exp.amount?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isFuelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-[#E5E5E7]">
            <div className="flex justify-between items-center p-4 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Log Fuel</h2>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFuel((data) => fuelMutation.mutate(data))} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Vehicle</label>
                <select
                  {...regFuel('vehicleId')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.licensePlate}</option>
                  ))}
                </select>
                {errFuel.vehicleId && <p className="text-red-500 text-sm mt-1">{errFuel.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Liters</label>
                <input
                  type="number"
                  step="0.1"
                  {...regFuel('liters', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.0"
                />
                {errFuel.liters && <p className="text-red-500 text-sm mt-1">{errFuel.liters.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...regFuel('cost', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.00"
                />
                {errFuel.cost && <p className="text-red-500 text-sm mt-1">{errFuel.cost.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fuelMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {fuelMutation.isPending ? 'Saving...' : 'Save Fuel Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-[#E5E5E7]">
            <div className="flex justify-between items-center p-4 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Add Expense</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExp((data) => expenseMutation.mutate(data))} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Vehicle</label>
                <select
                  {...regExp('vehicleId')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.licensePlate}</option>
                  ))}
                </select>
                {errExp.vehicleId && <p className="text-red-500 text-sm mt-1">{errExp.vehicleId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Category</label>
                <input
                  {...regExp('category')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="e.g. Tolls, Washing"
                />
                {errExp.category && <p className="text-red-500 text-sm mt-1">{errExp.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...regExp('amount', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.00"
                />
                {errExp.amount && <p className="text-red-500 text-sm mt-1">{errExp.amount.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {expenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
