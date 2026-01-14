import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  username: string;

  @IsEmail()
  @MaxLength(32)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}
