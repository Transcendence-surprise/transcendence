// src/game/dtos/playerState.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlayerStateDto {
  @ApiProperty()
  id: string | number;

  @ApiProperty()
  slotId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  x: number;

  @ApiProperty()
  y: number;

  @ApiProperty()
  hasMoved: boolean;

  @ApiProperty()
  skipsLeft: number;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}