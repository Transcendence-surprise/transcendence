// dtos/gameResult.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GameResultDto {
  @ApiProperty({ type: [String], description: 'IDs of winning players' })
  winnerIds: string[];
}
