import { AppDataSource } from '../data-source';
import { User } from '../../shared/entities/User';
import { Subscription, SubscriptionTier, BillingCycle } from '../../modules/subscriptions/domain/entities/Subscription';
import logger from '../../shared/utils/logger';

async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    const userRepository = AppDataSource.getRepository(User);
    const subscriptionRepository = AppDataSource.getRepository(Subscription);

    // Clear existing data
    await subscriptionRepository.delete({});
    await userRepository.delete({});
    logger.info('Cleared existing data');

    // Create test users
    const user1 = userRepository.create({
      email: 'test@example.com',
      name: 'Test User',
      freeMessagesRemaining: 3,
    });
    await userRepository.save(user1);
    logger.info(`Created user: ${user1.email}`);

    const user2 = userRepository.create({
      email: 'premium@example.com',
      name: 'Premium User',
      freeMessagesRemaining: 0,
    });
    await userRepository.save(user2);
    logger.info(`Created user: ${user2.email}`);

    // Create subscriptions for user2
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription1 = subscriptionRepository.create({
      userId: user2.id,
      tier: SubscriptionTier.PRO,
      maxMessages: 100,
      messagesUsed: 25,
      price: 29.99,
      billingCycle: BillingCycle.MONTHLY,
      autoRenew: true,
      startDate: now,
      endDate: endDate,
      renewalDate: endDate,
    });
    await subscriptionRepository.save(subscription1);
    logger.info(`Created PRO subscription for ${user2.email}`);

    logger.info('✅ Seed completed successfully!');
    logger.info('\n📧 Test Credentials:');
    logger.info('User 1 (Free): test@example.com');
    logger.info('User 2 (Premium): premium@example.com');

    await AppDataSource.destroy();
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
