import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  username: string;

  @IsEmail()
  @MaxLength(32)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  password: string;
}
