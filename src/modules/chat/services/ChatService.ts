import { AppDataSource } from '../../../database/data-source';
import { IChatService } from '../domain/interfaces/IChatService';
import { IOpenAIService } from '../domain/interfaces/IOpenAIService';
import { SubscriptionRepository } from '../../subscriptions/repositories/SubscriptionRepository';
import { UserRepository } from '../../../shared/repositories/UserRepository';
import { ChatMessage } from '../domain/entities/ChatMessage';
import { NotFoundError, QuotaExceededError } from '../../../shared/errors/AppError';
import logger from '../../../shared/utils/logger';

export class ChatService implements IChatService {
  constructor(
    private openAIService: IOpenAIService,
    private subscriptionRepository: SubscriptionRepository,
    private userRepository: UserRepository
  ) {}

  /**
   * Process a chat message with quota management
   * This is the CORE business logic!
   */
  async processMessage(
    userId: string,
    question: string
  ): Promise<{
    answer: string;
    tokensUsed: number;
    responseTime: number;
    usedFreeQuota: boolean;
    subscriptionId?: string;
  }> {
    // Step 1: Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Step 2: Check if free messages need reset (new month)
    if (user.needsFreeMessagesReset()) {
      user.resetFreeMessages();
      await this.userRepository.save(user);
      logger.info(`Reset free messages for user ${userId}`);
    }

    // Step 3: Generate AI response
    const { answer, tokensUsed, responseTime } = await this.openAIService.generateResponse(
      question
    );

    // Step 4: Quota management logic - THE HEART OF THE SYSTEM!
    let usedFreeQuota = false;
    let subscriptionId: string | undefined;

    // Use transaction to ensure atomicity
    await AppDataSource.transaction(async (manager) => {
      // Try free quota first
      if (user.hasFreeMessages()) {
        user.deductFreeMessage();
        await manager.save(user);
        usedFreeQuota = true;
        logger.info(`Used free quota for user ${userId}. Remaining: ${user.freeMessagesRemaining}`);
      } else {
        // No free messages - check subscriptions
        const subscription = await this.subscriptionRepository.findAvailableSubscription(userId);

        if (!subscription) {
          throw new QuotaExceededError(
            'No available quota. Please purchase a subscription to continue.'
          );
        }

        // Deduct from subscription
        subscription.deductMessage();
        await manager.save(subscription);
        subscriptionId = subscription.id;
        usedFreeQuota = false;

        logger.info(
          `Used subscription ${subscription.id} for user ${userId}. Remaining: ${subscription.getRemainingMessages()}`
        );
      }

      // Save chat message
      const chatMessage = new ChatMessage();
      chatMessage.userId = userId;
      chatMessage.question = question;
      chatMessage.answer = answer;
      chatMessage.tokensUsed = tokensUsed;
      chatMessage.responseTime = responseTime;
      chatMessage.usedFreeQuota = usedFreeQuota;
      chatMessage.subscriptionId = subscriptionId || null;

      await manager.save(ChatMessage, chatMessage);
    });

    return {
      answer,
      tokensUsed,
      responseTime,
      usedFreeQuota,
      subscriptionId,
    };
  }
}