// src/modules/game/dto/join-game.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export enum PlayerRole {
  PLAYER = 'PLAYER',
  SPECTATOR = 'SPECTATOR',
}

export class JoinGameDto {
  @ApiProperty()
  @IsUUID()
  gameId: string;

  @ApiProperty({ enum: PlayerRole })
  @IsEnum(PlayerRole)
  role: PlayerRole;
}
