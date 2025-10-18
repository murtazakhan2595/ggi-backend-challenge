import { IOpenAIService } from '../domain/interfaces/IOpenAIService';
import { Config } from '../../../shared/config/config';

export class OpenAIMockService implements IOpenAIService {
  private readonly responses = [
    'Based on my understanding, ',
    "That's an interesting question! ",
    'Let me help you with that. ',
    'From my analysis, ',
    "Here's what I found: ",
    'Great question! ',
  ];

  private readonly explanations = [
    'the key factors to consider are scalability, performance, and maintainability.',
    'you should focus on user experience, security, and efficiency.',
    'modern best practices suggest using TypeScript for better type safety.',
    "it's important to implement proper error handling and validation.",
    'testing and documentation are crucial for long-term success.',
    'consider the trade-offs between complexity and simplicity.',
  ];

  /**
   * Generate a mocked OpenAI response with realistic delay
   */
  async generateResponse(question: string): Promise<{
    answer: string;
    tokensUsed: number;
    responseTime: number;
  }> {
    const startTime = Date.now();

    // Simulate API delay
    const delay = this.getRandomDelay();
    await this.sleep(delay);

    // Generate mock response
    const answer = this.generateMockAnswer(question);

    // Calculate tokens (rough estimate: ~4 chars per token)
    const tokensUsed = Math.ceil((question.length + answer.length) / 4);

    const responseTime = Date.now() - startTime;

    return {
      answer,
      tokensUsed,
      responseTime,
    };
  }

  /**
   * Generate a realistic mock answer
   */
  private generateMockAnswer(question: string): string {
    const prefix = this.responses[Math.floor(Math.random() * this.responses.length)];
    const explanation = this.explanations[Math.floor(Math.random() * this.explanations.length)];

    // Add some context based on question length
    let answer = `${prefix}${explanation}`;

    if (question.length > 100) {
      answer +=
        " Additionally, for complex scenarios like this, it's recommended to break down the problem into smaller, manageable parts and tackle each one systematically.";
    }

    return answer;
  }

  /**
   * Get random delay between min and max
   */
  private getRandomDelay(): number {
    const min = Config.OPENAI_MOCK_MIN_DELAY;
    const max = Config.OPENAI_MOCK_MAX_DELAY;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
