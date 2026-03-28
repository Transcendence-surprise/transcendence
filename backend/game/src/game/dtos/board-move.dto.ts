// src/game/dtos/board-move.dto.ts
import {
  ApiProperty,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Type, Transform } from 'class-transformer';

/* ======== Concrete Action DTOs ======== */

// SHIFT ROW
export class ShiftRowDto {
  @ApiProperty({ enum: ['SHIFT'] })
  @IsEnum(['SHIFT'])
  type!: 'SHIFT';

  @ApiProperty({ enum: ['ROW'] })
  @IsEnum(['ROW'])
  axis!: 'ROW';

  @ApiProperty({ description: 'Row index (0-based)' })
  @IsNumber()
  @Min(0)
  index!: number;

  @ApiProperty({ enum: ['LEFT', 'RIGHT'] })
  @IsEnum(['LEFT', 'RIGHT'])
  direction!: 'LEFT' | 'RIGHT';
}

// SHIFT COL
export class ShiftColDto {
  @ApiProperty({ enum: ['SHIFT'] })
  @IsEnum(['SHIFT'])
  type!: 'SHIFT';

  @ApiProperty({ enum: ['COL'] })
  @IsEnum(['COL'])
  axis!: 'COL';

  @ApiProperty({ description: 'Column index (0-based)' })
  @IsNumber()
  @Min(0)
  index!: number;

  @ApiProperty({ enum: ['UP', 'DOWN'] })
  @IsEnum(['UP', 'DOWN'])
  direction!: 'UP' | 'DOWN';
}

// ROTATE TILE
export class RotateTileDto {
  @ApiProperty({ enum: ['ROTATE_TILE'] })
  @IsEnum(['ROTATE_TILE'])
  type!: 'ROTATE_TILE';

  @ApiProperty({ description: 'X coordinate of tile' })
  @IsNumber()
  @Min(0)
  x!: number;

  @ApiProperty({ description: 'Y coordinate of tile' })
  @IsNumber()
  @Min(0)
  y!: number;
}

// SWAP TILES
export class SwapTilesDto {
  @ApiProperty({ enum: ['SWAP_TILES'] })
  @IsEnum(['SWAP_TILES'])
  type!: 'SWAP_TILES';

  @ApiProperty({ description: 'X1 coordinate of first tile' })
  @IsNumber()
  @Min(0)
  x1!: number;

  @ApiProperty({ description: 'Y1 coordinate of first tile' })
  @IsNumber()
  @Min(0)
  y1!: number;

  @ApiProperty({ description: 'X2 coordinate of second tile' })
  @IsNumber()
  @Min(0)
  x2!: number;

  @ApiProperty({ description: 'Y2 coordinate of second tile' })
  @IsNumber()
  @Min(0)
  y2!: number;
}

/* ======== Transform function ======== */
export function transformAction(value: any) {
  if (!value?.type) return value;

  switch (value.type) {
    case 'SHIFT':
      if (value.axis === 'ROW') return plainToInstance(ShiftRowDto, value);
      if (value.axis === 'COL') return plainToInstance(ShiftColDto, value);
      break;

    case 'ROTATE_TILE':
      return plainToInstance(RotateTileDto, value);

    case 'SWAP_TILES':
      return plainToInstance(SwapTilesDto, value);
  }

  return value; // fallback
}

/* ======== BoardMoveDto ======== */
@ApiExtraModels(ShiftRowDto, ShiftColDto, RotateTileDto, SwapTilesDto)
export class BoardMoveDto {
  @ApiProperty()
  @IsUUID()
  gameId!: string;

  @ApiProperty({
    description: 'The board action to perform',
    oneOf: [
      { $ref: getSchemaPath(ShiftRowDto) },
      { $ref: getSchemaPath(ShiftColDto) },
      { $ref: getSchemaPath(RotateTileDto) },
      { $ref: getSchemaPath(SwapTilesDto) },
    ],
  })
  @ValidateNested()
  @Type(() => Object) // fallback for class-transformer
  @Transform(({ value }) => transformAction(value))
  action!: ShiftRowDto | ShiftColDto | RotateTileDto | SwapTilesDto;
}