import { ApiProperty } from '@nestjs/swagger';

export class GetUserResDto {
  @ApiProperty({ type: 'number', example: 21 })
  id: number;

  @ApiProperty({ type: 'string', example: 'tmp_test_user' })
  username: string;

  @ApiProperty({ type: 'string', example: 'tmp@example.com' })
  email: string;

  @ApiProperty({ type: 'integer', example: 42, required: false })
  avatarImageId?: number | null;

  @ApiProperty({ type: 'string', example: 'https://cdn.example.com/avatar.png', required: false })
  avatarUrl?: string | null;

  @ApiProperty({ type: 'array', example: 'user, admin' })
  roles: string[];

  @ApiProperty({ type: 'boolean', example: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z' })
  createdAt: string;

  @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z' })
  updatedAt: string;

  @ApiProperty({ type: 'number', example: 0 })
  rankNumber: number;

  @ApiProperty({ type: 'number', example: 0 })
  winStreak: number;

  @ApiProperty({ type: 'number', example: 0 })
  totalGames: number;

  @ApiProperty({ type: 'number', example: 0 })
  totalWins: number;
}
