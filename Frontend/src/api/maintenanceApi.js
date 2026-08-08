import axiosClient from './axiosClient';

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenance', { params }).then(r => r.data),
  create: (data) => axiosClient.post('/maintenance', data).then(r => r.data),
  close: (id) => axiosClient.put(`/maintenance/${id}/close`).then(r => r.data),
};
