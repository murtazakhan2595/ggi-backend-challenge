import request from 'supertest';
import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/shared/entities/User';
import express, { Application } from 'express';
import chatRoutes from '../../src/modules/chat/routes';
import { errorHandler } from '../../src/shared/middleware/errorHandler';

describe('Chat API Integration Tests', () => {
  let app: Application;
  let testUser: User;
  const TEST_EMAIL = 'integration-test@example.com';

  beforeAll(async () => {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes);
    app.use(errorHandler);

    // Cleanup any existing test user first (with CASCADE)
    const userRepository = AppDataSource.getRepository(User);
    await AppDataSource.query(
      'DELETE FROM chat_messages WHERE "userId" IN (SELECT id FROM users WHERE email = $1)',
      [TEST_EMAIL]
    );
    await userRepository.delete({ email: TEST_EMAIL });

    // Create fresh test user
    testUser = userRepository.create({
      email: TEST_EMAIL,
      name: 'Integration Test User',
      freeMessagesRemaining: 3,
    });
    testUser = await userRepository.save(testUser);
  });

  afterAll(async () => {
    // Cleanup test data
    await AppDataSource.query('DELETE FROM chat_messages WHERE "userId" = $1', [testUser.id]);
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ email: TEST_EMAIL });

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/chat', () => {
    it('should return 200 and AI response when valid request', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          userId: testUser.id,
          question: 'What is Clean Architecture?',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.answer).toBeDefined();
      expect(response.body.data.tokensUsed).toBeGreaterThan(0);
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          question: 'What is TypeScript?',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 when question is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          userId: testUser.id,
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/chat/history/:userId', () => {
    it('should return chat history for user', async () => {
      const response = await request(app).get(`/api/chat/history/${testUser.id}`).expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.messages).toBeDefined();
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });
  });
});
