// dtos/turnActions.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TurnActionsDto {
  @ApiProperty({ type: Object, description: 'How many rotates each player has done this turn' })
  rotateCount: Record<string, number>;

  @ApiProperty({ description: 'Has shift been done this turn?' })
  shiftDone: boolean;

  @ApiProperty({ description: 'Has swap been done this turn?' })
  swapDone: boolean;
}