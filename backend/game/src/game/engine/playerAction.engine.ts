// src/game/engine/playerAction.engine.ts
import { PlayerAction, PlayerActionResult, PlayerActionError } from "../models/playerAction";
import { GameState } from "../models/state";
import { validatePlayerAction } from "./helpers/move.validator";
import { collectItemsAlongPath } from "./helpers/collectItem";
import { updatePlayerObjectives } from "./helpers/objectivesUpdate";
import { checkWinCondition } from "./helpers/checkwin";
import { advanceTurn } from "./helpers/turnHandler";

export function processPlayerAction(
  state: GameState,
  action: PlayerAction
): PlayerActionResult {
  const player = state.players[state.currentPlayerIndex];
  if (!player) {
    return { ok: false, error: PlayerActionError.PLAYER_NOT_FOUND };
  }

  const progress = state.playerProgress[player.id.toString()];
  if (!progress) {
    return { ok: false, error: PlayerActionError.PLAYER_NOT_FOUND };
  }

  // VALIDATION
  const validation = validatePlayerAction(state, player, action);
  if (!validation.valid) {
    return { ok: false, error: PlayerActionError.INVALID_ACTION };
  }

  // APPLY MOVEMENT (final position only)
  const finalStep = action.path[action.path.length - 1];
  if (finalStep) {
    player.x = finalStep.x;
    player.y = finalStep.y;
  }

  player.hasMoved = true;

  // COLLECT ITEMS
  const collected = collectItemsAlongPath(state, player, action.path);

  if (collected.length > 0) {
    progress.collectedItems.push(...collected);
  }

  // UPDATE NEXT COLLECTIBLE (MULTI)
  if (state.rules.mode === "MULTI" && collected.length > 0) {
    const next = state.level.collectibles?.find(
      c =>
        c.ownerSlotId === player.slotId &&
        !progress.collectedItems.includes(c.id)
    );

    progress.currentCollectibleId = next?.id;
  }

  updatePlayerObjectives(state, player);

  // 7️⃣ CHECK WIN
  const win = checkWinCondition(state, player);
  if (win) {
    state.gameEnded = true;
    state.gameResult = { winnerId: player.id.toString() };
    state.phase = "END";

    return { ok: true, action };
  }

  // 8️⃣ TURN HANDLING
  if (state.rules.mode === "MULTI") {
    advanceTurn(state);
  } else {
    player.hasMoved = false;
  }

  return { ok: true, action };
}