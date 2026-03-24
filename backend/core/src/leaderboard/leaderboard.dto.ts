import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ description: 'User id of winner' })
  userId: number;

  @ApiProperty({ description: 'Username of winner', nullable: true })
  username: string | null;

  @ApiProperty({ description: 'Total wins today' })
  wins: number;
}
