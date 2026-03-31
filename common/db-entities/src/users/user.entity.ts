import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../media/image.entity';

@Entity({ name: 'users' })
@Index('users_email_unique_not_null', ['email'], {
  unique: true,
  where: '"email" IS NOT NULL',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 32, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  @Column({ name: 'avatar_image_id', type: 'int', nullable: true })
  avatarImageId: number | null;

  @ManyToOne(() => Image, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'avatar_image_id' })
  avatarImage: Image | null;

  @Column({ name: 'roles', type: 'text', array: true, default: ['user'] })
  roles: string[];

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'rank_number', type: 'int', default: 0 })
  rankNumber: number;

  @Column({ name: 'win_streak', type: 'int', default: 0 })
  winStreak: number;

  @Column({ name: 'total_games', type: 'int', default: 0 })
  totalGames: number;

  @Column({ name: 'total_wins', type: 'int', default: 0 })
  totalWins: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
