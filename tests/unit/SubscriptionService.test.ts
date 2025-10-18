import { SubscriptionService } from '../../src/modules/subscriptions/services/SubscriptionService';
import { SubscriptionRepository } from '../../src/modules/subscriptions/repositories/SubscriptionRepository';
import { UserRepository } from '../../src/shared/repositories/UserRepository';
import { User } from '../../src/shared/entities/User';
import {
  Subscription,
  SubscriptionTier,
  BillingCycle,
  SubscriptionStatus,
} from '../../src/modules/subscriptions/domain/entities/Subscription';
import { NotFoundError, ValidationError } from '../../src/shared/errors/AppError';

jest.mock('../../src/modules/subscriptions/repositories/SubscriptionRepository');
jest.mock('../../src/shared/repositories/UserRepository');

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    subscriptionRepository = new SubscriptionRepository() as jest.Mocked<SubscriptionRepository>;
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;

    subscriptionService = new SubscriptionService(subscriptionRepository, userRepository);
  });

  describe('createSubscription', () => {
    it('should create a BASIC subscription successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = new User();
      mockUser.id = userId;

      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      subscriptionRepository.save = jest.fn().mockImplementation((sub) => Promise.resolve(sub));

      // Act
      const subscription = await subscriptionService.createSubscription(
        userId,
        SubscriptionTier.BASIC,
        BillingCycle.MONTHLY,
        true
      );

      // Assert
      expect(subscription.tier).toBe(SubscriptionTier.BASIC);
      expect(subscription.maxMessages).toBe(10);
      expect(subscription.price).toBe(4.99);
      expect(subscription.autoRenew).toBe(true);
      expect(subscriptionRepository.save).toHaveBeenCalled();
    });

    it('should create a PRO subscription with yearly billing', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = new User();
      mockUser.id = userId;

      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      subscriptionRepository.save = jest.fn().mockImplementation((sub) => Promise.resolve(sub));

      // Act
      const subscription = await subscriptionService.createSubscription(
        userId,
        SubscriptionTier.PRO,
        BillingCycle.YEARLY,
        false
      );

      // Assert
      expect(subscription.tier).toBe(SubscriptionTier.PRO);
      expect(subscription.maxMessages).toBe(100);
      expect(subscription.price).toBe(299.99);
      expect(subscription.billingCycle).toBe(BillingCycle.YEARLY);
      expect(subscription.autoRenew).toBe(false);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      userRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionService.createSubscription(
          'non-existent',
          SubscriptionTier.BASIC,
          BillingCycle.MONTHLY,
          true
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel an active subscription', async () => {
      // Arrange
      const subscriptionId = 'sub-123';
      const userId = 'user-123';

      const mockSubscription = new Subscription();
      mockSubscription.id = subscriptionId;
      mockSubscription.status = SubscriptionStatus.ACTIVE;
      mockSubscription.cancel = jest.fn();

      subscriptionRepository.findByIdAndUserId = jest.fn().mockResolvedValue(mockSubscription);
      subscriptionRepository.save = jest.fn().mockResolvedValue(mockSubscription);

      // Act
      await subscriptionService.cancelSubscription(subscriptionId, userId);

      // Assert
      expect(mockSubscription.cancel).toHaveBeenCalledTimes(1);
      expect(subscriptionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError when subscription not found', async () => {
      // Arrange
      subscriptionRepository.findByIdAndUserId = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionService.cancelSubscription('non-existent', 'user-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when already cancelled', async () => {
      // Arrange
      const mockSubscription = new Subscription();
      mockSubscription.status = SubscriptionStatus.CANCELLED;

      subscriptionRepository.findByIdAndUserId = jest.fn().mockResolvedValue(mockSubscription);

      // Act & Assert
      await expect(subscriptionService.cancelSubscription('sub-123', 'user-123')).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('toggleAutoRenew', () => {
    it('should toggle auto-renew from true to false', async () => {
      // Arrange
      const mockSubscription = new Subscription();
      mockSubscription.id = 'sub-123';
      mockSubscription.autoRenew = true;
      mockSubscription.endDate = new Date();

      subscriptionRepository.findByIdAndUserId = jest.fn().mockResolvedValue(mockSubscription);
      subscriptionRepository.save = jest.fn().mockResolvedValue(mockSubscription);

      // Act
      const result = await subscriptionService.toggleAutoRenew('sub-123', 'user-123');

      // Assert
      expect(result.autoRenew).toBe(false);
      expect(result.renewalDate).toBeNull();
    });

    it('should toggle auto-renew from false to true', async () => {
      // Arrange
      const endDate = new Date();
      const mockSubscription = new Subscription();
      mockSubscription.id = 'sub-123';
      mockSubscription.autoRenew = false;
      mockSubscription.endDate = endDate;

      subscriptionRepository.findByIdAndUserId = jest.fn().mockResolvedValue(mockSubscription);
      subscriptionRepository.save = jest.fn().mockResolvedValue(mockSubscription);

      // Act
      const result = await subscriptionService.toggleAutoRenew('sub-123', 'user-123');

      // Assert
      expect(result.autoRenew).toBe(true);
      expect(result.renewalDate).toEqual(endDate);
    });
  });
});
