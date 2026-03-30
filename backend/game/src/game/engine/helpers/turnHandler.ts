// src/game/engine/helpers/turnHandler.ts
import { GameState } from "../../models/state";

export function advanceTurn(state: GameState) {
  const players = state.players;

  if (players.length === 0) return;

  // next player index
  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % players.length;

  const nextPlayer = players[state.currentPlayerIndex];

  state.currentPlayerId = nextPlayer.id;
  state.moveStartedAt = Date.now();

  // reset per-turn flags
  for (const p of players) {
    p.hasMoved = false;
  }

  // reset board action requirement
  state.boardActionsPending = state.rules.requiresBoardActionPerTurn;
}