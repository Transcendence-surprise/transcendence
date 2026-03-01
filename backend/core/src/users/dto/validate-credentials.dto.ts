import { IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCredDto {
  @ApiProperty({
    description: 'Username or email for authentication',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  @Matches(/\S/, { message: 'password must contain a non-whitespace character' })
  password: string;
}
