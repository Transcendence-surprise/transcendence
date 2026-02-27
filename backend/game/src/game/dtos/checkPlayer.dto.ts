import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsIn,
  IsNumber,
} from 'class-validator';

export class CheckPlayerAvailabilityDto {
  @ApiProperty({
    description: 'True if player is free to start a new game',
  })
  @IsBoolean()
  ok: boolean;

  @ApiPropertyOptional({
    description: 'Game ID where the player is currently participating',
    example: 'game-uuid-123',
  })
  @IsOptional()
  @IsString()
  gameId?: string;

  @ApiPropertyOptional({
    description: 'Current phase of the game',
    example: 'LOBBY',
    enum: ['LOBBY', 'PLAY'],
  })
  @IsOptional()
  @IsIn(['LOBBY', 'PLAY'])
  phase?: 'LOBBY' | 'PLAY';
}