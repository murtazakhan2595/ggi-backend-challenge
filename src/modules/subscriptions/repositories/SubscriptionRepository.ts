import { Repository } from 'typeorm';
import { AppDataSource } from '../../../database/data-source';
import { Subscription, SubscriptionStatus } from '../domain/entities/Subscription';

export class SubscriptionRepository {
  private repository: Repository<Subscription>;

  constructor() {
    this.repository = AppDataSource.getRepository(Subscription);
  }

  /**
   * Save a subscription
   */
  async save(subscription: Subscription): Promise<Subscription> {
    return await this.repository.save(subscription);
  }

  /**
   * Find subscription by ID
   */
  async findById(id: string): Promise<Subscription | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Find subscription by ID and user ID (for authorization)
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Subscription | null> {
    return await this.repository.findOne({
      where: { id, userId },
    });
  }

  /**
   * Get all active subscriptions for a user
   */
  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    return await this.repository.find({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all subscriptions for a user (any status)
   */
  async findAllByUserId(userId: string): Promise<Subscription[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find subscription with available messages
   */
  async findAvailableSubscription(userId: string): Promise<Subscription | null> {
    const subscriptions = await this.findActiveByUserId(userId);

    // Filter valid subscriptions with available messages
    const validSubscriptions = subscriptions.filter(
      (sub) => sub.isValid() && sub.hasMessagesAvailable()
    );

    if (validSubscriptions.length === 0) {
      return null;
    }

    // Sort by remaining messages (descending) - use the one with most quota
    validSubscriptions.sort(
      (a, b) => b.getRemainingMessages() - a.getRemainingMessages()
    );

    return validSubscriptions[0];
  }

  /**
   * Get subscriptions that need renewal
   */
  async findSubscriptionsForRenewal(): Promise<Subscription[]> {
    const now = new Date();

    return await this.repository
      .createQueryBuilder('subscription')
      .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('subscription.autoRenew = :autoRenew', { autoRenew: true })
      .andWhere('subscription.endDate <= :now', { now })
      .getMany();
  }
}