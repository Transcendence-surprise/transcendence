// src/game/utils/enrichGamePlayers.ts

export function enrichGamePlayers(
  gameState: any,
  userById: Map<string, { avatarUrl: string | null }>,
) {
  if (!gameState || !Array.isArray(gameState.players)) {
    return gameState;
  }

  return {
    ...gameState,
    players: gameState.players.map((player: any) => ({
      ...player,
      avatarUrl:
        player.avatarUrl ??
        userById.get(String(player.id))?.avatarUrl ??
        null,
    })),
  };
}
