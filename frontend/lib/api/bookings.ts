import axios from 'axios';
import { getApiUrl } from '../api-url';
import { getTenantConfig } from '../tenant';

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  addonsPrice: number;
  totalPrice: number;
  isPaid: boolean;
  status: string;
  customerNotes?: string;
  internalNotes?: string;
  customers?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  services?: {
    id: string;
    name: string;
  };
  employees?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  customerId: string;
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  addonsPrice?: number;
  totalPrice: number;
  isPaid?: boolean;
  status?: string;
  customerNotes?: string;
  internalNotes?: string;
}

export const bookingsApi = {
  async getAll(filters?: { startDate?: string; endDate?: string; employeeId?: string }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    
    const response = await axios.get(`${getApiUrl()}/api/bookings?${params}`, getTenantConfig());
    return response.data;
  },

  async getOne(id: string): Promise<Booking> {
    const response = await axios.get(`${getApiUrl()}/api/bookings/${id}`, getTenantConfig());
    return response.data;
  },

  async create(data: CreateBookingData): Promise<Booking> {
    const response = await axios.post(`${getApiUrl()}/api/bookings`, data, getTenantConfig());
    return response.data;
  },

  async update(id: string, data: Partial<CreateBookingData>): Promise<Booking> {
    const response = await axios.patch(`${getApiUrl()}/api/bookings/${id}`, data, getTenantConfig());
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${getApiUrl()}/api/bookings/${id}`, getTenantConfig());
    return response.data;
  },
};
