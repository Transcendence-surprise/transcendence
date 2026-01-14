// dtos/board.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BoardDto {
  @ApiProperty({ type: [Object], description: '2D array of board tiles' })
  tiles: string[][];
}