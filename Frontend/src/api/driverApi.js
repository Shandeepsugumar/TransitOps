import axiosClient from './axiosClient';

export const driverApi = {
  getAll: (params) => axiosClient.get('/drivers', { params }).then(r => r.data),
  getAvailable: () => axiosClient.get('/drivers/available').then(r => r.data),
  getById: (id) => axiosClient.get(`/drivers/${id}`).then(r => r.data),
  create: (data) => axiosClient.post('/drivers', data).then(r => r.data),
  update: (id, data) => axiosClient.put(`/drivers/${id}`, data).then(r => r.data),
};
