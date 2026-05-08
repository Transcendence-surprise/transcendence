import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
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
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/\S/, { message: 'password must contain a non-whitespace character' })
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

  @ApiProperty({
    description: 'Avatar image id from images table',
    example: 42,
    required: false,
  })
  @IsOptional()
  @IsInt()
  avatarImageId?: number;
}
