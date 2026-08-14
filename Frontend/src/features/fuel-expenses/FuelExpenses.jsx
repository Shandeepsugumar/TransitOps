import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, X, Fuel, DollarSign } from 'lucide-react';
import { fuelExpenseApi } from '../../api/fuelExpenseApi';
import { vehicleApi } from '../../api/vehicleApi';
import { useAuthStore } from '../../store/authStore';

const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  liters: z.number().min(0.1, 'Liters must be > 0'),
  cost: z.number().min(0, 'Cost must be positive'),
  date: z.string().min(1, 'Date is required'),
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  type: z.enum(['TOLL', 'WASHING', 'PARKING', 'INSURANCE', 'OTHER']),
  amount: z.number().min(0.01, 'Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export default function FuelExpenses() {
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const canModify = role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';

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
    defaultValues: { type: 'TOLL' }
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
    <div className="space-y-6 bg-[#F7F7F8] min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Fuel & Expenses</h1>
          <p className="text-[#6B6B70] mt-1">Track fuel consumption and operational costs</p>
        </div>
        {canModify && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-white border border-[#E5E5E7] text-[#1C1C1E] px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </button>
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Fuel Log
            </button>
          </div>
        )}
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

      <div className="bg-white rounded-lg border border-[#E5E5E7] shadow-sm overflow-hidden overflow-x-auto">
        {activeTab === 'fuel' && (
          <table className="w-full text-left border-collapse">
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
                <tr><td colSpan="4" className="p-8 text-center text-[#6B6B70]">Loading...</td></tr>
              ) : fuelLogs.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-[#6B6B70]">No fuel logs found.</td></tr>
              ) : (
                fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 text-[#1C1C1E]">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-4 text-[#1C1C1E] font-medium">{log.vehicle?.registrationNumber || `Vehicle ${log.vehicleId}`}</td>
                    <td className="p-4 text-[#1C1C1E]">{log.liters?.toFixed(1)} L</td>
                    <td className="p-4 text-[#1C1C1E] font-medium">${log.cost?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'expenses' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70] text-sm">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E7]">
              {isLoadingExpenses ? (
                <tr><td colSpan="5" className="p-8 text-center text-[#6B6B70]">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[#6B6B70]">No expenses found.</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 text-[#1C1C1E]">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="p-4 text-[#1C1C1E] font-medium">{exp.vehicle?.registrationNumber || `Vehicle ${exp.vehicleId}`}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{exp.type}</span>
                    </td>
                    <td className="p-4 text-[#1C1C1E] font-medium">${exp.amount?.toFixed(2)}</td>
                    <td className="p-4 text-[#6B6B70]">{exp.notes}</td>
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
            <div className="flex justify-between items-center p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Log Fuel</h2>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form method="post" onSubmit={handleFuel((data) => fuelMutation.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Vehicle</label>
                <select
                  {...regFuel('vehicleId')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
                  ))}
                </select>
                {errFuel.vehicleId && <p className="text-red-500 text-xs mt-1">{errFuel.vehicleId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Date</label>
                  <input
                    type="date"
                    {...regFuel('date')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errFuel.date && <p className="text-red-500 text-xs mt-1">{errFuel.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Liters</label>
                  <input
                    type="number"
                    step="0.1"
                    {...regFuel('liters', { valueAsNumber: true })}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errFuel.liters && <p className="text-red-500 text-xs mt-1">{errFuel.liters.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...regFuel('cost', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
                {errFuel.cost && <p className="text-red-500 text-xs mt-1">{errFuel.cost.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fuelMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
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
            <div className="flex justify-between items-center p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Add Expense</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-[#1C1C1E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form method="post" onSubmit={handleExp((data) => expenseMutation.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Vehicle</label>
                <select
                  {...regExp('vehicleId')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
                  ))}
                </select>
                {errExp.vehicleId && <p className="text-red-500 text-xs mt-1">{errExp.vehicleId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Type</label>
                  <select
                    {...regExp('type')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  >
                    <option value="TOLL">Toll</option>
                    <option value="WASHING">Washing</option>
                    <option value="PARKING">Parking</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errExp.type && <p className="text-red-500 text-xs mt-1">{errExp.type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Date</label>
                  <input
                    type="date"
                    {...regExp('date')}
                    className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                  {errExp.date && <p className="text-red-500 text-xs mt-1">{errExp.date.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...regExp('amount', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="0.00"
                />
                {errExp.amount && <p className="text-red-500 text-xs mt-1">{errExp.amount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Notes</label>
                <textarea
                  {...regExp('notes')}
                  className="w-full bg-gray-50 border border-[#E5E5E7] rounded-lg p-2.5 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  placeholder="Additional details..."
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E5E7]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E5E7] text-[#1C1C1E] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseMutation.isPending}
                  className="px-4 py-2 bg-[#D97706] text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
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
