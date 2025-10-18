import { ISubscriptionService } from '../domain/interfaces/ISubscriptionService';
import {
  Subscription,
  SubscriptionTier,
  BillingCycle,
  SubscriptionStatus,
} from '../domain/entities/Subscription';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { UserRepository } from '../../../shared/repositories/UserRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Config } from '../../../shared/config/config';
import logger from '../../../shared/utils/logger';

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private userRepository: UserRepository
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    autoRenew: boolean
  ): Promise<Subscription> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get subscription details based on tier
    const { maxMessages, price } = this.getSubscriptionDetails(tier, billingCycle);

    // Calculate dates
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, billingCycle);
    const renewalDate = autoRenew ? endDate : null;

    // Create subscription
    const subscription = new Subscription();
    subscription.userId = userId;
    subscription.tier = tier;
    subscription.maxMessages = maxMessages;
    subscription.price = price;
    subscription.billingCycle = billingCycle;
    subscription.autoRenew = autoRenew;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.renewalDate = renewalDate;
    subscription.status = SubscriptionStatus.ACTIVE;

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    logger.info(`Created ${tier} subscription for user ${userId}`);

    return savedSubscription;
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await this.subscriptionRepository.findAllByUserId(userId);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByIdAndUserId(
      subscriptionId,
      userId
    );

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new ValidationError('Subscription is already cancelled');
    }

    subscription.cancel();
    const updated = await this.subscriptionRepository.save(subscription);

    logger.info(`Cancelled subscription ${subscriptionId} for user ${userId}`);

    return updated;
  }

  /**
   * Toggle auto-renew on/off
   */
  async toggleAutoRenew(subscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByIdAndUserId(
      subscriptionId,
      userId
    );

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    subscription.autoRenew = !subscription.autoRenew;

    if (subscription.autoRenew) {
      subscription.renewalDate = subscription.endDate;
    } else {
      subscription.renewalDate = null;
    }

    const updated = await this.subscriptionRepository.save(subscription);

    logger.info(
      `Toggled auto-renew ${subscription.autoRenew ? 'ON' : 'OFF'} for subscription ${subscriptionId}`
    );

    return updated;
  }

  /**
   * Process renewals for subscriptions (would be called by cron job)
   */
  async processRenewals(): Promise<void> {
    const subscriptionsToRenew = await this.subscriptionRepository.findSubscriptionsForRenewal();

    logger.info(`Processing ${subscriptionsToRenew.length} subscription renewals`);

    for (const subscription of subscriptionsToRenew) {
      try {
        // Simulate payment processing
        const paymentSuccess = this.simulatePayment();

        if (paymentSuccess) {
          subscription.renew();
          await this.subscriptionRepository.save(subscription);
          logger.info(`Renewed subscription ${subscription.id}`);
        } else {
          subscription.markPaymentFailed();
          await this.subscriptionRepository.save(subscription);
          logger.warn(`Payment failed for subscription ${subscription.id}`);
        }
      } catch (error) {
        logger.error(`Error renewing subscription ${subscription.id}:`, error);
      }
    }
  }

  /**
   * Get subscription details (max messages, price) based on tier and cycle
   */
  private getSubscriptionDetails(
    tier: SubscriptionTier,
    billingCycle: BillingCycle
  ): { maxMessages: number; price: number } {
    const isYearly = billingCycle === BillingCycle.YEARLY;

    switch (tier) {
      case SubscriptionTier.BASIC:
        return {
          maxMessages: 10,
          price: isYearly ? 49.99 : 4.99,
        };
      case SubscriptionTier.PRO:
        return {
          maxMessages: 100,
          price: isYearly ? 299.99 : 29.99,
        };
      case SubscriptionTier.ENTERPRISE:
        return {
          maxMessages: Number.MAX_SAFE_INTEGER, // Unlimited
          price: isYearly ? 999.99 : 99.99,
        };
      default:
        throw new ValidationError('Invalid subscription tier');
    }
  }

  /**
   * Calculate end date based on billing cycle
   */
  private calculateEndDate(startDate: Date, billingCycle: BillingCycle): Date {
    const endDate = new Date(startDate);

    if (billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return endDate;
  }

  /**
   * Simulate payment processing (random success/failure)
   */
  private simulatePayment(): boolean {
    return Math.random() > Config.PAYMENT_FAILURE_RATE;
  }
}
