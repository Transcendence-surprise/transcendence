import { ApiProperty } from '@nestjs/swagger';
import { GetUserDto } from './get-user.dto';

export class GetUserResDto extends GetUserDto {
  @ApiProperty({
    type: 'number',
    description: 'HTTP status code',
    example: 200,
  })
  status?: number;
}
