import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetRequestResDto {
  @ApiProperty({ type: 'boolean', example: true, description: 'Password reset request accepted' })
  ok: boolean;
}
