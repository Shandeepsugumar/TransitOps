import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const { data } = await axiosClient.post('/auth/login', credentials);
    return data;
  }
};
