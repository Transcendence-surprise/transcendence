import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWith2FADto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
