import axiosClient from './axiosClient';

export const vehicleApi = {
  getAll: (params) => axiosClient.get('/vehicles', { params }).then(r => r.data),
  getAvailable: () => axiosClient.get('/vehicles/available').then(r => r.data),
  getById: (id) => axiosClient.get(`/vehicles/${id}`).then(r => r.data),
  create: (data) => axiosClient.post('/vehicles', data).then(r => r.data),
  update: (id, data) => axiosClient.put(`/vehicles/${id}`, data).then(r => r.data),
  remove: (id) => axiosClient.delete(`/vehicles/${id}`),
  getOperationalCost: (id) => axiosClient.get(`/vehicles/${id}/operational-cost`).then(r => r.data),
};
