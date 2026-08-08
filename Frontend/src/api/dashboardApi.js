import axiosClient from './axiosClient';

export const dashboardApi = {
  getKpis: () => axiosClient.get('/dashboard/kpis').then(r => r.data),
};
