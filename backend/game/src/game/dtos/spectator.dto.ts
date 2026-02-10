// dtos/spectator.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SpectatorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}