// src/game/engine/helpers/turnHandler.ts
import { GameState } from "../../models/state";
import { collectItemsAlongPath } from "./collectItem";
import { updatePlayerObjectives } from "./objectivesUpdate";
import { checkWinCondition } from "./checkwin";
import { GamePhase } from '@transcendence/db-entities';

export function beginCurrentTurn(state: GameState, now = Date.now()) {
  const players = state.players;
  if (players.length === 0) return;

  const currentPlayer = players[state.currentPlayerIndex];
  if (!currentPlayer) return;

  state.currentPlayerId = currentPlayer.id;
  state.moveStartedAt = now;

  // reset per-turn flags
  for (const p of players) {
    p.hasMoved = false;
  }

  // reset board action requirement
  state.boardActionsPending = state.rules.requiresBoardActionPerTurn;

  // Turn-start auto-collect: if player is already on a collectible tile.
  const progress = state.playerProgress[currentPlayer.id.toString()];
  if (!progress) return;

  const collected = collectItemsAlongPath(state, currentPlayer, [
    { x: currentPlayer.x, y: currentPlayer.y },
  ]);

  if (collected.length === 0) return;

  progress.collectedItems.push(...collected);

  if (state.rules.mode === "MULTI") {
    const next = state.level.collectibles?.find(
      (c) =>
        c.ownerSlotId === currentPlayer.slotId &&
        !progress.collectedItems.includes(c.id)
    );
    progress.currentCollectibleId = next?.id;
  }

  updatePlayerObjectives(state, currentPlayer);

  const win = checkWinCondition(state, currentPlayer);
  if (win) {
    state.gameEnded = true;
    state.gameResult = { winnerId: currentPlayer.id.toString() };
    state.endReason = "WIN";
    state.phase = GamePhase.END;
  }
}

export function advanceTurn(state: GameState) {
  const players = state.players;

  if (players.length === 0) return;

  // next player index
  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % players.length;

  beginCurrentTurn(state);
}