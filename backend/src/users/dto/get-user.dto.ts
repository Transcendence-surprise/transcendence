import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
  @ApiProperty({ type: 'number', example: 1 })
  id: number;

  @ApiProperty({ type: 'string', example: 'john_doe' })
  username: string;

  @ApiProperty({ type: 'string', example: 'john@example.com' })
  email: string;

  @ApiProperty({ type: 'string', example: 'registered' })
  userType: string;

  @ApiProperty({ type: 'string', example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ type: 'string', example: '2023-01-01T00:00:00.000Z' })
  updatedAt: string;
}
