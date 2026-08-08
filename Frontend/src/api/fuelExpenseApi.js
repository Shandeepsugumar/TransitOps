import axiosClient from './axiosClient';

export const fuelExpenseApi = {
  getFuelLogs: (params) => axiosClient.get('/fuel-logs', { params }).then(r => r.data),
  createFuelLog: (data) => axiosClient.post('/fuel-logs', data).then(r => r.data),
  getExpenses: (params) => axiosClient.get('/expenses', { params }).then(r => r.data),
  createExpense: (data) => axiosClient.post('/expenses', data).then(r => r.data),
};
