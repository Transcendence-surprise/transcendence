import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class LoginUserResponseDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  access_token: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
}
