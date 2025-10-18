import { OpenAIMockService } from '../../src/modules/chat/services/OpenAIMockService';

describe('OpenAIMockService', () => {
  let openAIService: OpenAIMockService;

  beforeEach(() => {
    openAIService = new OpenAIMockService();
  });

  describe('generateResponse', () => {
    it('should generate a response with answer, tokens, and response time', async () => {
      // Arrange
      const question = 'What is TypeScript?';

      // Act
      const result = await openAIService.generateResponse(question);

      // Assert
      expect(result.answer).toBeDefined();
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.responseTime).toBeGreaterThanOrEqual(500);
      expect(result.responseTime).toBeLessThanOrEqual(2100); // Allow some buffer
    });

    it('should calculate tokens approximately (4 chars per token)', async () => {
      // Arrange
      const question = 'Test question';

      // Act
      const result = await openAIService.generateResponse(question);

      // Assert
      const totalChars = question.length + result.answer.length;
      const expectedTokens = Math.ceil(totalChars / 4);
      expect(result.tokensUsed).toBe(expectedTokens);
    });

    it('should add extra content for long questions', async () => {
      // Arrange
      const shortQuestion = 'Short?';
      const longQuestion = 'A'.repeat(150); // > 100 chars

      // Act
      const shortResult = await openAIService.generateResponse(shortQuestion);
      const longResult = await openAIService.generateResponse(longQuestion);

      // Assert
      expect(longResult.answer.length).toBeGreaterThan(shortResult.answer.length);
    });

    it('should have realistic delay between min and max', async () => {
      // Arrange
      const question = 'Test?';
      const startTime = Date.now();

      // Act
      await openAIService.generateResponse(question);
      const elapsed = Date.now() - startTime;

      // Assert
      expect(elapsed).toBeGreaterThanOrEqual(500);
      expect(elapsed).toBeLessThanOrEqual(2100);
    });
  });
});
