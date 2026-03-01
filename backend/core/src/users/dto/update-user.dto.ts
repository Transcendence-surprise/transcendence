import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    maxLength: 32,
  })
  @IsString()
  @MaxLength(32)
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
    maxLength: 254,
  })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Password (optional, will be hashed if provided)',
    example: 'SecurePass123!',
    required: false,
    minLength: 8,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;

  @ApiProperty({
    description: 'User roles',
    example: ['user', 'admin'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({
    description: 'Enable or disable 2FA via email',
    example: false,
  })
  @IsBoolean()
  twoFactorEnabled: boolean;
}
