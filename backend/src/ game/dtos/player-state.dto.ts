// dtos/player-state.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PlayerStateDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  score: number;
}