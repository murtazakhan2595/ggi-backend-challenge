import { Repository } from 'typeorm';
import { AppDataSource } from '../../../database/data-source';
import { ChatMessage } from '../domain/entities/ChatMessage';

export class ChatRepository {
  private repository: Repository<ChatMessage>;

  constructor() {
    this.repository = AppDataSource.getRepository(ChatMessage);
  }

  /**
   * Save a chat message
   */
  async save(chatMessage: ChatMessage): Promise<ChatMessage> {
    return await this.repository.save(chatMessage);
  }

  /**
   * Get chat history for a user
   */
  async findByUserId(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get total messages count for a user
   */
  async countByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId },
    });
  }

  /**
   * Get messages by subscription
   */
  async findBySubscriptionId(subscriptionId: string): Promise<ChatMessage[]> {
    return await this.repository.find({
      where: { subscriptionId },
      order: { createdAt: 'DESC' },
    });
  }
}
