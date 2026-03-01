import { ApiProperty } from '@nestjs/swagger';
import { GetUserResDto } from './get-user-res.dto';

export class LoginUserResDto {
  @ApiProperty({ type: () => GetUserResDto })
  user: GetUserResDto;
}
