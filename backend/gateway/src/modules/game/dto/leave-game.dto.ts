import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class LeaveGameDto {
  @ApiProperty({ description: 'ID of the game to leave' })
  @IsUUID()
  gameId: string;
}