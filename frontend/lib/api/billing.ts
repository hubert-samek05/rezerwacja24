/**
 * API Client dla systemu subskrypcji i płatności
 */

import { getApiUrl } from '../api-url';

const API_URL = getApiUrl();

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  currency: string;
  trialDays: number;
  requiresPaymentMethod: boolean;
  features: any;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'INCOMPLETE';
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePaymentMethodId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  lastPaymentStatus?: string;
  lastPaymentError?: string;
  subscription_plans: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  tenantId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  paidAt?: string;
  createdAt: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  remainingTrialDays: number;
}

export const billingApi = {
  /**
   * Pobiera aktywny plan subskrypcji
   */
  async getActivePlan(): Promise<SubscriptionPlan> {
    const response = await fetch(`${API_URL}/api/billing/plan`);
    if (!response.ok) throw new Error('Failed to fetch plan');
    return response.json();
  },

  /**
   * Pobiera subskrypcję użytkownika
   */
  async getSubscription(token: string): Promise<Subscription | null> {
    const response = await fetch(`${API_URL}/api/billing/subscription`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch subscription');
    return response.json();
  },

  /**
   * Pobiera szczegóły subskrypcji
   */
  async getSubscriptionDetails(token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/billing/subscription/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch subscription details');
    return response.json();
  },

  /**
   * Pobiera status subskrypcji
   */
  async getSubscriptionStatus(token: string): Promise<SubscriptionStatus> {
    const response = await fetch(`${API_URL}/api/billing/subscription/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch subscription status');
    return response.json();
  },

  /**
   * Tworzy checkout session
   */
  async createCheckoutSession(
    token: string,
    email: string,
  ): Promise<{ sessionId: string; url: string }> {
    const response = await fetch(`${API_URL}/api/billing/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
  },

  /**
   * Tworzy billing portal session
   */
  async createBillingPortalSession(token: string): Promise<{ url: string }> {
    const response = await fetch(`${API_URL}/api/billing/portal-session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to create billing portal session');
    return response.json();
  },

  /**
   * Anuluje subskrypcję
   */
  async cancelSubscription(token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/billing/subscription`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to cancel subscription');
    return response.json();
  },

  /**
   * Wznawia subskrypcję
   */
  async resumeSubscription(token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/billing/subscription/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to resume subscription');
    return response.json();
  },

  /**
   * Pobiera faktury
   */
  async getInvoices(token: string): Promise<Invoice[]> {
    const response = await fetch(`${API_URL}/api/billing/invoices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  /**
   * Pobiera statystyki subskrypcji (admin)
   */
  async getSubscriptionStats(token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/billing/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch subscription stats');
    return response.json();
  },
};
