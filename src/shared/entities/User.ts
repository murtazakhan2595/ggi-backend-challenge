import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 3 })
  freeMessagesRemaining: number;

  @Column({ type: 'date', nullable: true })
  freeMessagesResetDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('ChatMessage', 'user')
  chatMessages: any[];

  @OneToMany('Subscription', 'user')
  subscriptions: any[];

  /**
   * Reset free messages quota (called on 1st of each month)
   */
  resetFreeMessages(): void {
    this.freeMessagesRemaining = 3;
    this.freeMessagesResetDate = new Date();
  }

  /**
   * Check if free messages reset is needed
   */
  needsFreeMessagesReset(): boolean {
    if (!this.freeMessagesResetDate) {
      return true;
    }

    const lastReset = new Date(this.freeMessagesResetDate);
    const now = new Date();

    // Reset if we're in a new month
    return (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    );
  }

  /**
   * Deduct one free message
   */
  deductFreeMessage(): void {
    if (this.freeMessagesRemaining > 0) {
      this.freeMessagesRemaining--;
    }
  }

  /**
   * Check if user has free messages available
   */
  hasFreeMessages(): boolean {
    return this.freeMessagesRemaining > 0;
  }
}
