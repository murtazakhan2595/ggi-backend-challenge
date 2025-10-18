import { Subscription, SubscriptionTier, BillingCycle } from '../entities/Subscription';

export interface ISubscriptionService {
  createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    autoRenew: boolean
  ): Promise<Subscription>;

  getUserSubscriptions(userId: string): Promise<Subscription[]>;

  cancelSubscription(subscriptionId: string, userId: string): Promise<Subscription>;

  toggleAutoRenew(subscriptionId: string, userId: string): Promise<Subscription>;

  processRenewals(): Promise<void>;
}
