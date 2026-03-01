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

export class UpdateUserPartialDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    maxLength: 32,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  username?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
    maxLength: 254,
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty({
    description: 'Password (will be hashed if provided)',
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
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({
    description: 'Enable or disable 2FA via email',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}
