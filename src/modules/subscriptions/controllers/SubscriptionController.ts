import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { UserRepository } from '../../../shared/repositories/UserRepository';
import logger from '../../../shared/utils/logger';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    const subscriptionRepository = new SubscriptionRepository();
    const userRepository = new UserRepository();

    this.subscriptionService = new SubscriptionService(subscriptionRepository, userRepository);
  }

  /**
   * POST /api/subscriptions
   * Create a new subscription
   */
  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, tier, billingCycle, autoRenew } = req.body;

      logger.info(`Creating ${tier} subscription for user ${userId}`);

      const subscription = await this.subscriptionService.createSubscription(
        userId,
        tier,
        billingCycle,
        autoRenew
      );

      res.status(201).json({
        status: 'success',
        data: {
          subscription,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subscriptions/:userId
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      logger.info(`Fetching subscriptions for user ${userId}`);

      const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        status: 'success',
        data: {
          subscriptions,
          count: subscriptions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/subscriptions/:id/cancel
   * Cancel a subscription
   */
  async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      logger.info(`Cancelling subscription ${id} for user ${userId}`);

      const subscription = await this.subscriptionService.cancelSubscription(id, userId);

      res.status(200).json({
        status: 'success',
        message: 'Subscription cancelled successfully',
        data: {
          subscription,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/subscriptions/:id/toggle-autorenew
   * Toggle auto-renew on/off
   */
  async toggleAutoRenew(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      logger.info(`Toggling auto-renew for subscription ${id}`);

      const subscription = await this.subscriptionService.toggleAutoRenew(id, userId);

      res.status(200).json({
        status: 'success',
        message: `Auto-renew ${subscription.autoRenew ? 'enabled' : 'disabled'}`,
        data: {
          subscription,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}