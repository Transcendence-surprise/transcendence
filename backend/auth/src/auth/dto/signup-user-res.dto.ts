import { ApiProperty } from '@nestjs/swagger';
import { GetUserResDto } from './get-user-res.dto';

export class SignupUserResDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  access_token: string;

  @ApiProperty({ type: () => GetUserResDto })
  user: GetUserResDto;
}
