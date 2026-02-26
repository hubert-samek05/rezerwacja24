import axios from 'axios';
import { getApiUrl } from '../api-url';
import { getTenantConfig } from '../tenant';

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  service_categories?: {
    id: string;
    name: string;
    color: string;
  };
  basePrice: number;
  currency: string;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  maxCapacity: number;
  image?: string;
  gallery: string[];
  requiresDeposit: boolean;
  depositAmount: number;
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  // Rezerwacje elastyczne
  bookingType?: string;
  flexibleDuration?: boolean;
  minDuration?: number;
  maxDuration?: number;
  durationStep?: number;
  allowMultiDay?: boolean;
  pricePerHour?: number;
  pricePerDay?: number;
  employees?: Array<{
    id: string;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
  service_employees?: Array<{
    id: string;
    employeeId: string;
    employees: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
  _count?: {
    bookings: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  order: number;
  _count?: {
    services: number;
  };
}

export interface CreateServiceData {
  name: string;
  description?: string;
  type?: string;
  categoryId?: string;
  basePrice: number;
  currency?: string;
  duration: number;
  bufferBefore?: number;
  bufferAfter?: number;
  maxCapacity?: number;
  image?: string;
  gallery?: string[];
  requiresDeposit?: boolean;
  depositAmount?: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
  isActive?: boolean;
  employeeIds?: string[];
  // Rezerwacje elastyczne
  bookingType?: string;
  flexibleDuration?: boolean;
  minDuration?: number;
  maxDuration?: number;
  durationStep?: number;
  allowMultiDay?: boolean;
  pricePerHour?: number;
  pricePerDay?: number;
}

export const servicesApi = {
  // Services
  async getAll(filters?: { categoryId?: string; isActive?: boolean }): Promise<Service[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const response = await axios.get(`${getApiUrl()}/api/services?${params}`, getTenantConfig());
    return response.data;
  },

  async getOne(id: string): Promise<Service> {
    const response = await axios.get(`${getApiUrl()}/api/services/${id}`, getTenantConfig());
    return response.data;
  },

  async create(data: CreateServiceData): Promise<Service> {
    const response = await axios.post(`${getApiUrl()}/api/services`, data, getTenantConfig());
    return response.data;
  },

  async update(id: string, data: Partial<CreateServiceData>): Promise<Service> {
    const response = await axios.patch(`${getApiUrl()}/api/services/${id}`, data, getTenantConfig());
    return response.data;
  },

  async delete(id: string, force?: boolean): Promise<{ message: string }> {
    const url = force ? `${getApiUrl()}/api/services/${id}?force=true` : `${getApiUrl()}/api/services/${id}`;
    const response = await axios.delete(url, getTenantConfig());
    return response.data;
  },

  async getStats(id: string): Promise<{ totalBookings: number; bookingsThisMonth: number; totalRevenue: number }> {
    const response = await axios.get(`${getApiUrl()}/api/services/${id}/stats`, getTenantConfig());
    return response.data;
  },

  // Categories
  async getAllCategories(): Promise<ServiceCategory[]> {
    const response = await axios.get(`${getApiUrl()}/api/service-categories`, getTenantConfig());
    return response.data;
  },

  async createCategory(data: { name: string; description?: string; icon?: string; color?: string; order?: number }): Promise<ServiceCategory> {
    const response = await axios.post(`${getApiUrl()}/api/service-categories`, data, getTenantConfig());
    return response.data;
  },

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; icon?: string; color?: string; order?: number }>): Promise<ServiceCategory> {
    const response = await axios.patch(`${getApiUrl()}/api/service-categories/${id}`, data, getTenantConfig());
    return response.data;
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${getApiUrl()}/api/service-categories/${id}`, getTenantConfig());
    return response.data;
  },
};
