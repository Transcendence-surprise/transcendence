import { ApiProperty } from '@nestjs/swagger';

export class LatestGamesDto {
  @ApiProperty({
    type: String,
    enum: ['win', 'lose'],
    description: 'Result of the match',
  })
  result: string;

  @ApiProperty({
    type: [String],
    description: 'Usernames of opponents',
  })
  opponents: string[];

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the match was created',
  })
  createdAt: string;
}
