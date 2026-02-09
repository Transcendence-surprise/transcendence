// dtos/player-progress.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PlayerProgressDto {
  @ApiProperty()
  collectedItems: number;

  @ApiProperty()
  objectivesCompleted: number;
}