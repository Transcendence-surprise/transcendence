export class JoinGameDto {
  gameId: string;
  playerId: string;
  role: 'PLAYER' | 'SPECTATOR';
}
