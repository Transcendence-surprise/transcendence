import { ApiProperty } from '@nestjs/swagger';

export class MultiGameDto {
  @ApiProperty({ description: 'Unique game ID' })
  id: string;

  @ApiProperty({ description: 'Host ID (or nickname later)' })
  hostId: string;

  @ApiProperty({ description: 'Current phase of the game', enum: ['LOBBY', 'PLAY'] })
  phase: 'LOBBY' | 'PLAY';

  @ApiProperty({ description: 'Maximum number of players allowed' })
  maxPlayers: number;

  @ApiProperty({ description: 'Number of players currently joined' })
  joinedPlayers: number;

  @ApiProperty({ description: 'Whether spectators are allowed' })
  allowSpectators: boolean;

  @ApiProperty({ description: 'Number of collectibles per player' })
  collectiblesPerPlayer: number;

  @ApiProperty({ description: 'Optional description of the game', required: false })
  description?: string;
}
