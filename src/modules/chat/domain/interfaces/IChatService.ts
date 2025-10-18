export interface IChatService {
  processMessage(
    userId: string,
    question: string
  ): Promise<{
    answer: string;
    tokensUsed: number;
    responseTime: number;
    usedFreeQuota: boolean;
    subscriptionId?: string;
  }>;
}
