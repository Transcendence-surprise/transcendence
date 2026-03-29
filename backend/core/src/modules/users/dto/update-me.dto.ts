import { IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMeDto {
  @ApiProperty({
    description: 'Enable or disable 2FA via email',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiProperty({
    description: 'Avatar image id from images table',
    example: 42,
    required: false,
  })
  @IsOptional()
  @IsInt()
  avatarImageId?: number;
}
