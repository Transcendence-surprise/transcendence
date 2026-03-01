import { ApiProperty } from '@nestjs/swagger';

export class LogoutResDto {
  @ApiProperty({ type: 'boolean', example: true, description: 'Logout successful' })
  ok: boolean;
}
