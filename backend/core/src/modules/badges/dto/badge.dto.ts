import { ApiProperty } from '@nestjs/swagger';

export class BadgeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class UserBadgeDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  unlockedAt: Date;
}
