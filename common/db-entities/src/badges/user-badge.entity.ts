// src/badges/user-badge.entity.ts

import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Badge } from './badge.entity';

@Entity({ name: 'user_badges' })
@Index('user_badges_user_badge_unique', ['userId', 'badgeId'], { unique: true })
export class UserBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'badge_id', type: 'int' })
  badgeId: number;

  @ManyToOne(() => Badge, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ name: 'unlocked_at', type: 'timestamptz', nullable: true })
  unlockedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}