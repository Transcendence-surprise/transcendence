import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGuestTokenDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(1, { message: 'Nickname must not be empty' })
  @MaxLength(20, { message: 'Nickname must be at most 20 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Nickname can only contain letters, numbers, underscores, and hyphens',
  })
  nickname: string;
}
