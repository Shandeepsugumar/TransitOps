import axiosClient from './axiosClient';

export const dashboardApi = {
  getKpis: (params) => axiosClient.get('/dashboard/kpis', { params }).then(r => r.data),
};
