// src/modules/game/dto/player-move.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
  @ApiProperty()
  @IsNumber()
  x!: number;

  @ApiProperty()
  @IsNumber()
  y!: number;
}

export class PlayerMoveDto {
  @ApiProperty()
  @IsUUID()
  gameId!: string;

  @ApiProperty({ type: [PointDto] })
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  path!: PointDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  skip?: boolean;
}