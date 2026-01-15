import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Username for authentication',
    example: 'john_doe',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  password: string;
}
