// src/game/engine/helpers/collectItem.ts
import { GameState, PlayerState } from "../../models/state";

export function collectItemsAlongPath(
  state: GameState,
  player: PlayerState,
  path: { x: number; y: number }[]
): string[] {
  const collected: string[] = [];
  const progress = state.playerProgress[player.id.toString()];

  for (const step of path) {
    const tile = state.board.tiles[step.y]?.[step.x];
    if (!tile || !tile.collectableId) continue;

    const collectibleId = tile.collectableId;

    // SINGLE PLAYER → collect everything
    if (state.rules.mode === "SINGLE") {
      collected.push(collectibleId);
      tile.collectableId = undefined; // remove from board
      continue;
    }

    // MULTIPLAYER
    const collectible = state.level.collectibles?.find(
      c => c.id === collectibleId
    );

    if (!collectible) continue;

    // must belong to player
    if (collectible.ownerSlotId !== player.slotId) continue;

    // must be current target
    if (progress.currentCollectibleId !== collectibleId) continue;

    collected.push(collectibleId);
    tile.collectableId = undefined; // remove from board
  }

  return collected;
}