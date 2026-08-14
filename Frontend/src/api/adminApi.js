import axiosClient from './axiosClient';

export const adminApi = {
  getPendingApprovals: async () => {
    const { data } = await axiosClient.get('/companies/pending-approvals');
    return data;
  },
  approveUser: async (userId) => {
    const { data } = await axiosClient.put(`/companies/approvals/${userId}/approve`);
    return data;
  },
  rejectUser: async (userId) => {
    const { data } = await axiosClient.put(`/companies/approvals/${userId}/reject`);
    return data;
  }
};
