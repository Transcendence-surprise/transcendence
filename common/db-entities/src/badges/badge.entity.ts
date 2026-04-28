// src/entities/badge.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'badges' })
@Index('badges_key_unique', ['key'], { unique: true })
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  key: string; // e.g. "first-game", "games-20"

  @Column({ length: 128 })
  name: string;

  @Column({ name: 'condition_type', length: 32 })
  conditionType: string; // 'wins', 'games', 'streak'

  @Column({ name: 'condition_value', type: 'int' })
  conditionValue: number;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}