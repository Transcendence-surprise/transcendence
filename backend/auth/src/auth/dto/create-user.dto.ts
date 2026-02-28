import { IsEmail, IsString, MaxLength, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username or email for authentication',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  username: string;

  @ApiProperty({
    description: 'Username or email for authentication',
    example: 'john_doe@gmail.com',
  })
  @IsEmail()
  @MaxLength(32)
  email: string;

  @ApiProperty({
    description: 'User password (optional for OAuth users)',
    example: 'securePassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password?: string;
}
