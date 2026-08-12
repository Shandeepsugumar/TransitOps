import axiosClient from './axiosClient';

export const teamApi = {
  getTeamMembers: async () => {
    const { data } = await axiosClient.get('/team/users');
    return data;
  },
  addTeamMember: async (userData) => {
    const { data } = await axiosClient.post('/team/users', userData);
    return data;
  },
  updateTeamMember: async ({ id, ...userData }) => {
    const { data } = await axiosClient.put(`/team/users/${id}`, userData);
    return data;
  }
};
