import axiosClient from './axiosClient';

export const companyApi = {
  registerCompany: async (data) => {
    const response = await axiosClient.post('/companies/register', data);
    return response.data;
  }
};
