import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../shared/entities/User';
import { ChatMessage } from '../modules/chat/domain/entities/ChatMessage';
import { Subscription } from '../modules/subscriptions/domain/entities/Subscription';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ggi_backend_test',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync in dev only
  logging: process.env.NODE_ENV === 'development',
  entities: [User, ChatMessage, Subscription],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
});
