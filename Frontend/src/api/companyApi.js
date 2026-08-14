import axiosClient from './axiosClient';

export const companyApi = {
  registerCompany: async (data) => {
    const response = await axiosClient.post('/companies/register', data);
    return response.data;
  },
  searchCompanies: async (query) => {
    const response = await axiosClient.get(`/companies/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  joinCompany: async (data) => {
    const response = await axiosClient.post('/companies/join', data);
    return response.data;
  },
};
