import axios from 'axios';
import { getApiUrl } from '../api-url';
import { getTenantConfig } from '../tenant';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface UpdateCouponData {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export const promotionsApi = {
  // Coupons
  async getAll(): Promise<Coupon[]> {
    const response = await axios.get(`${getApiUrl()}/api/coupons`, getTenantConfig());
    return response.data;
  },

  async getOne(id: string): Promise<Coupon> {
    const response = await axios.get(`${getApiUrl()}/api/coupons/${id}`, getTenantConfig());
    return response.data;
  },

  async create(data: CreateCouponData): Promise<Coupon> {
    const response = await axios.post(`${getApiUrl()}/api/coupons`, data, getTenantConfig());
    return response.data;
  },

  async update(id: string, data: UpdateCouponData): Promise<Coupon> {
    const response = await axios.patch(`${getApiUrl()}/api/coupons/${id}`, data, getTenantConfig());
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${getApiUrl()}/api/coupons/${id}`, getTenantConfig());
    return response.data;
  },

  // Validate coupon code (for public use)
  async validateCode(code: string): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const response = await axios.post(`${getApiUrl()}/api/coupons/validate`, { code }, getTenantConfig());
    return response.data;
  },
};
