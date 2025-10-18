import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/ChatService';
import { ChatRepository } from '../repositories/ChatRepository';
import { SubscriptionRepository } from '../../subscriptions/repositories/SubscriptionRepository';
import { UserRepository } from '../../../shared/repositories/UserRepository';
import { OpenAIMockService } from '../services/OpenAIMockService';
import logger from '../../../shared/utils/logger';

export class ChatController {
  private chatService: ChatService;
  private chatRepository: ChatRepository;

  constructor() {
    const openAIService = new OpenAIMockService();
    const chatRepository = new ChatRepository();
    const subscriptionRepository = new SubscriptionRepository();
    const userRepository = new UserRepository();

    this.chatService = new ChatService(
      openAIService,
      chatRepository,
      subscriptionRepository,
      userRepository
    );
    this.chatRepository = chatRepository;
  }

  /**
   * POST /api/chat
   * Process a chat message
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, question } = req.body;

      logger.info(`Processing chat message for user ${userId}`);

      const result = await this.chatService.processMessage(userId, question);

      res.status(200).json({
        status: 'success',
        data: {
          answer: result.answer,
          tokensUsed: result.tokensUsed,
          responseTime: result.responseTime,
          quotaInfo: {
            usedFreeQuota: result.usedFreeQuota,
            subscriptionId: result.subscriptionId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/history/:userId
   * Get chat history for a user
   */
  async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      logger.info(`Fetching chat history for user ${userId}`);

      const messages = await this.chatRepository.findByUserId(userId, limit);

      res.status(200).json({
        status: 'success',
        data: {
          messages,
          count: messages.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}