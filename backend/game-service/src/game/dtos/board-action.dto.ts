// dtos/board-action.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BoardActionDto {
  @ApiProperty()
  actionType: string;

  @ApiProperty()
  payload: any;
}
