import { ChatService } from '../../src/modules/chat/services/ChatService';
import { OpenAIMockService } from '../../src/modules/chat/services/OpenAIMockService';
import { SubscriptionRepository } from '../../src/modules/subscriptions/repositories/SubscriptionRepository';
import { UserRepository } from '../../src/shared/repositories/UserRepository';
import { User } from '../../src/shared/entities/User';
import {
  Subscription,
  SubscriptionTier,
  SubscriptionStatus,
} from '../../src/modules/subscriptions/domain/entities/Subscription';
import { QuotaExceededError, NotFoundError } from '../../src/shared/errors/AppError';

// Mock repositories
jest.mock('../../src/modules/chat/repositories/ChatRepository');
jest.mock('../../src/modules/subscriptions/repositories/SubscriptionRepository');
jest.mock('../../src/shared/repositories/UserRepository');
jest.mock('../../src/database/data-source', () => ({
  AppDataSource: {
    transaction: jest.fn((callback) => callback({
      save: jest.fn((entity) => Promise.resolve(entity)),
    })),
  },
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let openAIService: OpenAIMockService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create service instances
    openAIService = new OpenAIMockService();
    subscriptionRepository = new SubscriptionRepository() as jest.Mocked<SubscriptionRepository>;
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;

    chatService = new ChatService(
      openAIService,
      subscriptionRepository,
      userRepository
    );
  });

  describe('processMessage', () => {
    it('should use free quota when available', async () => {
      // Arrange
      const userId = 'user-123';
      const question = 'What is TypeScript?';

      const mockUser = new User();
      mockUser.id = userId;
      mockUser.freeMessagesRemaining = 3;
      mockUser.needsFreeMessagesReset = jest.fn().mockReturnValue(false);
      mockUser.hasFreeMessages = jest.fn().mockReturnValue(true);
      mockUser.deductFreeMessage = jest.fn();

      userRepository.findById = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await chatService.processMessage(userId, question);

      // Assert
      expect(result.usedFreeQuota).toBe(true);
      expect(result.subscriptionId).toBeUndefined();
      expect(mockUser.deductFreeMessage).toHaveBeenCalledTimes(1);
    });

    it('should reset free messages when new month', async () => {
      // Arrange
      const userId = 'user-123';
      const question = 'What is TypeScript?';

      const mockUser = new User();
      mockUser.id = userId;
      mockUser.freeMessagesRemaining = 0;
      mockUser.needsFreeMessagesReset = jest.fn().mockReturnValue(true);
      mockUser.resetFreeMessages = jest.fn();
      mockUser.hasFreeMessages = jest.fn().mockReturnValue(true);
      mockUser.deductFreeMessage = jest.fn();

      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      userRepository.save = jest.fn().mockResolvedValue(mockUser);

      // Act
      await chatService.processMessage(userId, question);

      // Assert
      expect(mockUser.resetFreeMessages).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should use subscription when no free quota', async () => {
      // Arrange
      const userId = 'user-123';
      const question = 'What is TypeScript?';

      const mockUser = new User();
      mockUser.id = userId;
      mockUser.freeMessagesRemaining = 0;
      mockUser.needsFreeMessagesReset = jest.fn().mockReturnValue(false);
      mockUser.hasFreeMessages = jest.fn().mockReturnValue(false);

      const mockSubscription = new Subscription();
      mockSubscription.id = 'sub-123';
      mockSubscription.tier = SubscriptionTier.PRO;
      mockSubscription.maxMessages = 100;
      mockSubscription.messagesUsed = 50;
      mockSubscription.status = SubscriptionStatus.ACTIVE;
      mockSubscription.deductMessage = jest.fn();

      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      subscriptionRepository.findAvailableSubscription = jest.fn().mockResolvedValue(mockSubscription);

      // Act
      const result = await chatService.processMessage(userId, question);

      // Assert
      expect(result.usedFreeQuota).toBe(false);
      expect(result.subscriptionId).toBe('sub-123');
      expect(mockSubscription.deductMessage).toHaveBeenCalledTimes(1);
    });

    it('should throw QuotaExceededError when no quota available', async () => {
      // Arrange
      const userId = 'user-123';
      const question = 'What is TypeScript?';

      const mockUser = new User();
      mockUser.id = userId;
      mockUser.freeMessagesRemaining = 0;
      mockUser.needsFreeMessagesReset = jest.fn().mockReturnValue(false);
      mockUser.hasFreeMessages = jest.fn().mockReturnValue(false);

      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      subscriptionRepository.findAvailableSubscription = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(chatService.processMessage(userId, question)).rejects.toThrow(QuotaExceededError);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      const question = 'What is TypeScript?';

      userRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(chatService.processMessage(userId, question)).rejects.toThrow(NotFoundError);
    });
  });
});