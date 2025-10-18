import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../entities/User';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Save a user
   */
  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  /**
   * Create a new user
   */
  async create(email: string, name: string): Promise<User> {
    const user = this.repository.create({
      email,
      name,
      freeMessagesRemaining: 3,
    });
    return await this.repository.save(user);
  }
}
