import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorRequiredResDto {
  @ApiProperty({ description: 'Indicates that 2FA is required', example: true })
  twoFactorRequired: boolean;

  @ApiProperty({ description: 'User email where code was sent' })
  email: string;

  @ApiProperty({ description: 'Message to display to user' })
  message: string;
}
