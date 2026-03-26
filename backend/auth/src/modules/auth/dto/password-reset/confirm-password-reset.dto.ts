import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPasswordResetDto {
  @ApiProperty({
    description: 'One-time token received by email for resetting password',
    example: '3259b3090e7f9032b60e7f9a1a5f7b1a',
  })
  @IsString()
  @MinLength(24)
  @MaxLength(128)
  token: string;

  @ApiProperty({
    description: 'New password to set for the user',
    example: 'NewStrongP@ssword1',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
