import axios from 'axios';
import { getApiUrl } from '../api-url';

const API_URL = getApiUrl();

export const authApi = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    password: string;
    plan?: string; // starter, standard, pro
  }) {
    const response = await axios.post(`${API_URL}/api/auth/register`, data);
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data;
  },
};
