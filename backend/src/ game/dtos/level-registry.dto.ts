import { ApiProperty } from '@nestjs/swagger';

export class SingleLevelDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;
}