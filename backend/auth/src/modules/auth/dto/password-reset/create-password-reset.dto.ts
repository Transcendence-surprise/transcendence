import { IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePasswordResetDto {
  @ApiProperty({
    description: 'Email address associated with the user account',
    example: 'john@example.com',
  })
  @IsEmail()
  @MaxLength(64)
  email: string;
}
