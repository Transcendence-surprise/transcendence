import { MinLength, IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'biznez-den',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  username: string;

  @ApiProperty({
    description: 'User email',
    example: 'pata@gmail.com',
  })
  @IsEmail()
  @MaxLength(32)
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}
