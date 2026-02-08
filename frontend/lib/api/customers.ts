import axios from 'axios';
import { getApiUrl } from '../api-url';
import { getTenantConfig } from '../tenant';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  totalBookings: number;
  totalSpent: number;
  noShowCount: number;
  customerScore: number;
  isBlocked: boolean;
  blockedUntil?: string;
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const response = await axios.get(`${getApiUrl()}/api/customers`, getTenantConfig());
    return response.data;
  },

  async getOne(id: string): Promise<Customer> {
    const response = await axios.get(`${getApiUrl()}/api/customers/${id}`, getTenantConfig());
    return response.data;
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    const response = await axios.post(`${getApiUrl()}/api/customers`, data, getTenantConfig());
    return response.data;
  },

  async update(id: string, data: Partial<CreateCustomerData>): Promise<Customer> {
    const response = await axios.patch(`${getApiUrl()}/api/customers/${id}`, data, getTenantConfig());
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${getApiUrl()}/api/customers/${id}`, getTenantConfig());
    return response.data;
  },
};
