import * as dotenv from 'dotenv';

dotenv.config();

export class Config {
  // Application
  static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  static readonly PORT = parseInt(process.env.PORT || '3000');

  // Database
  static readonly DB_HOST = process.env.DB_HOST || 'localhost';
  static readonly DB_PORT = parseInt(process.env.DB_PORT || '5432');
  static readonly DB_USERNAME = process.env.DB_USERNAME || 'postgres';
  static readonly DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
  static readonly DB_DATABASE = process.env.DB_DATABASE || 'ggi_backend_test';

  // OpenAI Mock Settings
  static readonly OPENAI_MOCK_MIN_DELAY = parseInt(process.env.OPENAI_MOCK_MIN_DELAY || '500');
  static readonly OPENAI_MOCK_MAX_DELAY = parseInt(process.env.OPENAI_MOCK_MAX_DELAY || '2000');

  // Free Tier Settings
  static readonly FREE_MESSAGES_PER_MONTH = parseInt(
    process.env.FREE_MESSAGES_PER_MONTH || '3'
  );

  // Payment Simulation
  static readonly PAYMENT_FAILURE_RATE = parseFloat(process.env.PAYMENT_FAILURE_RATE || '0.2');

  static isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  static isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}
