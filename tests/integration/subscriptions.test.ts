import request from 'supertest';
import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/shared/entities/User';
import {
  SubscriptionTier,
  BillingCycle,
} from '../../src/modules/subscriptions/domain/entities/Subscription';
import express, { Application } from 'express';
import subscriptionRoutes from '../../src/modules/subscriptions/routes';
import { errorHandler } from '../../src/shared/middleware/errorHandler';

describe('Subscription API Integration Tests', () => {
  let app: Application;
  let testUser: User;
  const TEST_EMAIL = 'subscription-test@example.com';

  beforeAll(async () => {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use(errorHandler);

    // Cleanup any existing test user first (with CASCADE)
    const userRepository = AppDataSource.getRepository(User);
    await AppDataSource.query(
      'DELETE FROM subscriptions WHERE "userId" IN (SELECT id FROM users WHERE email = $1)',
      [TEST_EMAIL]
    );
    await AppDataSource.query(
      'DELETE FROM chat_messages WHERE "userId" IN (SELECT id FROM users WHERE email = $1)',
      [TEST_EMAIL]
    );
    await userRepository.delete({ email: TEST_EMAIL });

    // Create fresh test user
    testUser = userRepository.create({
      email: TEST_EMAIL,
      name: 'Subscription Test User',
      freeMessagesRemaining: 3,
    });
    testUser = await userRepository.save(testUser);
  });

  afterAll(async () => {
    // Cleanup test data (delete in correct order)
    await AppDataSource.query('DELETE FROM subscriptions WHERE "userId" = $1', [testUser.id]);
    await AppDataSource.query('DELETE FROM chat_messages WHERE "userId" = $1', [testUser.id]);

    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ email: TEST_EMAIL });

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/subscriptions', () => {
    it('should create a BASIC subscription', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .send({
          userId: testUser.id,
          tier: SubscriptionTier.BASIC,
          billingCycle: BillingCycle.MONTHLY,
          autoRenew: true,
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.subscription.tier).toBe(SubscriptionTier.BASIC);
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .send({
          tier: SubscriptionTier.BASIC,
          billingCycle: BillingCycle.MONTHLY,
          autoRenew: true,
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/subscriptions/:userId', () => {
    it('should return all subscriptions for user', async () => {
      const response = await request(app).get(`/api/subscriptions/${testUser.id}`).expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.subscriptions)).toBe(true);
    });
  });
});
