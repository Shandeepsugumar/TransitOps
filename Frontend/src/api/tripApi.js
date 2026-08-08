import axiosClient from './axiosClient';

export const tripApi = {
  getAll: (params) => axiosClient.get('/trips', { params }).then(r => r.data),
  create: (data) => axiosClient.post('/trips', data).then(r => r.data),
  dispatch: (id) => axiosClient.put(`/trips/${id}/dispatch`).then(r => r.data),
  complete: (id, data) => axiosClient.put(`/trips/${id}/complete`, data).then(r => r.data),
  cancel: (id) => axiosClient.put(`/trips/${id}/cancel`).then(r => r.data),
};
