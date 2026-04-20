import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ description: 'User id of winner' })
  userId: number;

  @ApiProperty({ description: 'Username of winner', nullable: true })
  username: string | null;

  @ApiProperty({ description: 'User win streak', default: 0 })
  winStreak: number;

  @ApiProperty({ description: 'Total wins (all-time) by this user on already ended games' })
  wins: number;

  @ApiProperty({ description: 'Total games played by user', default: 0 })
  totalGames: number;

  @ApiProperty({ description: 'User rank number', default: 0 })
  rank: number;

  @ApiProperty({ description: 'Avatar URL for the user', nullable: true })
  avatarUrl: string | null;

}
