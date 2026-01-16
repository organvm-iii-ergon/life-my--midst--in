/**
 * API client for billing and licensing endpoints
 */

export type CheckoutRequest = {
  tier: 'PRO' | 'ENTERPRISE';
  billingInterval: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResponse = {
  ok: boolean;
  data?: {
    sessionId: string;
    url: string;
    stripeCustomerId: string;
  };
  error?: string;
  message?: string;
};

export type Subscription = {
  id: string;
  profileId: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: string;
  billingInterval: 'monthly' | 'yearly' | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  plan: {
    name: string;
    features: Record<string, any>;
  };
};

export type SubscriptionResponse = {
  ok: boolean;
  data?: Subscription;
  error?: string;
  message?: string;
};

/**
 * Create Stripe checkout session and redirect to payment
 */
export async function createCheckoutSession(
  profileId: string,
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  const response = await fetch(`/api/billing/checkout/${profileId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return response.json();
}

/**
 * Get current subscription for profile
 */
export async function getSubscription(profileId: string): Promise<SubscriptionResponse> {
  const response = await fetch(`/api/billing/subscription/${profileId}`);
  return response.json();
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  profileId: string,
  atPeriodEnd: boolean = true,
): Promise<{ ok: boolean; message: string }> {
  const response = await fetch(`/api/billing/subscription/${profileId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ atPeriodEnd }),
  });

  return response.json();
}

/**
 * Get all subscription plans (FREE, PRO, ENTERPRISE)
 */
export async function getPlans(): Promise<{
  ok: boolean;
  data?: { plans: any[] };
}> {
  const response = await fetch('/api/billing/plans');
  return response.json();
}
