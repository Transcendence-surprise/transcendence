import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CheckPlayerAvailabilityDto {
  @ApiProperty({
    example: true,
    description: "True if player is not participating in any game",
  })
  ok: boolean;

  @ApiPropertyOptional({
    example: "game-uuid-123",
    description: "Game ID where the player is currently participating",
  })
  gameId?: string;
}
