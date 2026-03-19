import { ApiProperty } from '@nestjs/swagger';
import { GetUserResDto } from '../get-user-res.dto';

export class SignupUserResDto {
  @ApiProperty({ type: () => GetUserResDto })
  user: GetUserResDto;
}
