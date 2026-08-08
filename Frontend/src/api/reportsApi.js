import axiosClient from './axiosClient';

export const reportsApi = {
  getFuelEfficiency: () => axiosClient.get('/reports/fuel-efficiency').then(r => r.data),
  getOperationalCost: () => axiosClient.get('/reports/operational-cost').then(r => r.data),
  getRoi: () => axiosClient.get('/reports/roi').then(r => r.data),
  exportCsv: async (type) => {
    const response = await axiosClient.get(`/reports/export/csv?type=${type}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
