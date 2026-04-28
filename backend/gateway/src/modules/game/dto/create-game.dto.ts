// src/modules/game/dto/create-game.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty()
  gameId: string;
}