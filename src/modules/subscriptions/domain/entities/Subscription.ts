import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../shared/entities/User';

export enum SubscriptionTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SubscriptionTier })
  tier: SubscriptionTier;

  @Column({ type: 'int' })
  maxMessages: number;

  @Column({ type: 'int', default: 0 })
  messagesUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: BillingCycle })
  billingCycle: BillingCycle;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ default: true })
  autoRenew: boolean;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  renewalDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  /**
   * Get remaining messages in this subscription
   */
  getRemainingMessages(): number {
    if (this.tier === SubscriptionTier.ENTERPRISE) {
      return Number.MAX_SAFE_INTEGER; // Unlimited
    }
    return Math.max(0, this.maxMessages - this.messagesUsed);
  }

  /**
   * Check if subscription has messages available
   */
  hasMessagesAvailable(): boolean {
    if (this.tier === SubscriptionTier.ENTERPRISE) {
      return true;
    }
    return this.messagesUsed < this.maxMessages;
  }

  /**
   * Deduct one message from the subscription
   */
  deductMessage(): void {
    if (this.tier !== SubscriptionTier.ENTERPRISE) {
      this.messagesUsed++;
    }
  }

  /**
   * Check if subscription is currently valid
   */
  isValid(): boolean {
    const now = new Date();
    return (
      this.status === SubscriptionStatus.ACTIVE &&
      new Date(this.startDate) <= now &&
      new Date(this.endDate) >= now
    );
  }

  /**
   * Check if subscription is expired
   */
  isExpired(): boolean {
    const now = new Date();
    return new Date(this.endDate) < now;
  }

  /**
   * Cancel the subscription
   */
  cancel(): void {
    this.status = SubscriptionStatus.CANCELLED;
    this.autoRenew = false;
  }

  /**
   * Mark subscription as expired
   */
  markExpired(): void {
    this.status = SubscriptionStatus.EXPIRED;
  }

  /**
   * Renew the subscription for another period
   */
  renew(): void {
    const currentEnd = new Date(this.endDate);
    
    if (this.billingCycle === BillingCycle.MONTHLY) {
      currentEnd.setMonth(currentEnd.getMonth() + 1);
    } else {
      currentEnd.setFullYear(currentEnd.getFullYear() + 1);
    }

    this.startDate = new Date(this.endDate);
    this.endDate = currentEnd;
    this.renewalDate = currentEnd;
    this.messagesUsed = 0;
    this.status = SubscriptionStatus.ACTIVE;
  }

  /**
   * Simulate payment failure
   */
  markPaymentFailed(): void {
    this.status = SubscriptionStatus.INACTIVE;
    this.autoRenew = false;
  }
}
