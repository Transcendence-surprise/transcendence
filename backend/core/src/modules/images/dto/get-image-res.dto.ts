import { ApiProperty } from '@nestjs/swagger';

export class GetImageResDto {
  @ApiProperty({ type: 'number', example: 1 })
  id!: number;

  @ApiProperty({
    type: 'string',
    example: '/api/images/1/content',
  })
  url!: string;

  @ApiProperty({ type: 'string', example: 'logo-bolt.svg', required: false })
  filename?: string | null;

  @ApiProperty({ type: 'string', example: 'image/svg+xml', required: false })
  mimeType?: string | null;

  @ApiProperty({ type: 'number', example: 331, required: false })
  size?: number | null;

  @ApiProperty({ type: 'string', example: '2026-03-26T20:08:00.000Z' })
  createdAt!: string;
}
