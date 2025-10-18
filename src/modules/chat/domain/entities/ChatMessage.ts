import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'int' })
  tokensUsed: number;

  @Column({ type: 'int', nullable: true })
  responseTime: number; // in milliseconds

  @Column({ default: false })
  usedFreeQuota: boolean;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('User', 'chatMessages')
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column()
  userId: string;
}
