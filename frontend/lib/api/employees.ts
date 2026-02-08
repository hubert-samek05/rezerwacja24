import axios from 'axios';
import { getApiUrl } from '../api-url';
import { getTenantConfig } from '../tenant';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  specialties: string[];
  color: string;
  isActive: boolean;
  services?: Array<{
    id: string;
    service: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    bookings: number;
    services: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  specialties?: string[];
  color?: string;
  isActive?: boolean;
}

export const employeesApi = {
  async getAll(filters?: { isActive?: boolean }): Promise<Employee[]> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const response = await axios.get(`${getApiUrl()}/api/employees?${params}`, getTenantConfig());
    return response.data;
  },

  async getOne(id: string): Promise<Employee> {
    const response = await axios.get(`${getApiUrl()}/api/employees/${id}`, getTenantConfig());
    return response.data;
  },

  async create(data: CreateEmployeeData): Promise<Employee> {
    const response = await axios.post(`${getApiUrl()}/api/employees`, data, getTenantConfig());
    return response.data;
  },

  async update(id: string, data: Partial<CreateEmployeeData>): Promise<Employee> {
    const response = await axios.patch(`${getApiUrl()}/api/employees/${id}`, data, getTenantConfig());
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${getApiUrl()}/api/employees/${id}`, getTenantConfig());
    return response.data;
  },

  async getStats(id: string): Promise<{ totalBookings: number; bookingsThisMonth: number; totalRevenue: number }> {
    const response = await axios.get(`${getApiUrl()}/api/employees/${id}/stats`, getTenantConfig());
    return response.data;
  },

  async getAvailability(id: string): Promise<{
    workingHours: Array<{
      day: string;
      enabled: boolean;
      startTime: string;
      endTime: string;
    }>;
    timeOff?: Array<{
      id: string;
      date: Date;
      reason: string;
    }>;
  }> {
    const apiUrl = getApiUrl();
    console.log('🌐 GET availability URL:', `${apiUrl}/api/employees/${id}/availability`);
    const response = await axios.get(`${apiUrl}/api/employees/${id}/availability`, getTenantConfig());
    console.log('📥 GET availability response:', response.data);
    return response.data;
  },

  async updateAvailability(id: string, data: {
    workingHours: Array<{
      day: string;
      enabled: boolean;
      startTime: string;
      endTime: string;
    }>;
    timeOff?: Array<{
      id?: string;
      date: string;
      reason?: string;
    }>;
  }): Promise<any> {
    const apiUrl = getApiUrl();
    console.log('🌐 PUT availability URL:', `${apiUrl}/api/employees/${id}/availability`);
    console.log('📤 PUT availability data:', data);
    const response = await axios.put(`${apiUrl}/api/employees/${id}/availability`, data, getTenantConfig());
    console.log('📥 PUT availability response:', response.data);
    return response.data;
  },

  async addTimeOff(id: string, data: { date: string; reason?: string }): Promise<any> {
    const response = await axios.post(`${getApiUrl()}/api/employees/${id}/time-off`, data, getTenantConfig());
    return response.data;
  },

  async removeTimeOff(id: string, timeOffId: string): Promise<{ message: string }> {
    const response = await axios.delete(`${getApiUrl()}/api/employees/${id}/time-off/${timeOffId}`, getTenantConfig());
    return response.data;
  },
};
