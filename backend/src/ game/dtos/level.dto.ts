import { ApiProperty } from '@nestjs/swagger';

export class LevelDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}