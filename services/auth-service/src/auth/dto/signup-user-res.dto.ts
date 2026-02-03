import { ApiProperty } from '@nestjs/swagger';
import { UserResDto } from './user-res.dto';

export class SignupUserResDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  access_token: string;

  @ApiProperty({ type: () => UserResDto })
  user: UserResDto;
}
