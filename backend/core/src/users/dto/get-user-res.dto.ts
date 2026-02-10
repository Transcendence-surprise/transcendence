import { ApiProperty } from '@nestjs/swagger';

export class GetUserResDto {
  @ApiProperty({ type: 'number', example: 21 })
  id: number;

  @ApiProperty({ type: 'string', example: 'tmp_test_user' })
  username: string;

  @ApiProperty({ type: 'string', example: 'tmp@example.com' })
  email: string;

  @ApiProperty({ type: 'string', example: 'registered' })
  userType: string;

  @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z' })
  createdAt: string;

  @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z' })
  updatedAt: string;
}
