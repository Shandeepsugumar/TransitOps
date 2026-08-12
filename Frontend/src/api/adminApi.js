import axiosClient from './axiosClient';

export const adminApi = {
  getPendingCompanies: async () => {
    const { data } = await axiosClient.get('/admin/companies?status=PENDING');
    return data;
  },
  approveCompany: async (id) => {
    const { data } = await axiosClient.put(`/admin/companies/${id}/approve`);
    return data;
  },
  rejectCompany: async (id) => {
    const { data } = await axiosClient.put(`/admin/companies/${id}/reject`);
    return data;
  }
};
