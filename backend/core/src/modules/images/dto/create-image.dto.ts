import { IsString, IsOptional, IsUrl, MaxLength, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    description: 'Publicly accessible URL to image file',
    example: '/api/images/1/content',
  })
  @IsString()
  @IsUrl({ require_tld: false, allow_underscores: true })
  @MaxLength(1024)
  url!: string;

  @ApiProperty({
    description: 'Original image file name (optional)',
    example: 'avatar.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;

  @ApiProperty({
    description: 'Image MIME type (optional)',
    example: 'image/png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiProperty({
    description: 'Size in bytes (optional)',
    example: 31234,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;
}
