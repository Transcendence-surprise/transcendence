// dtos/game-rules.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GameRulesDto {
  @ApiProperty()
  maxPlayers: number;

  @ApiProperty()
  mode: string;
}