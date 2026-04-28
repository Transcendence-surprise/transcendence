// src/modules/game/dto/start-game.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartGameDto {
  @ApiProperty()
  @IsString()
  gameId: string;
}