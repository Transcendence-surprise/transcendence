import { GameState } from "../models/state";
import { JoinResult, JoinError } from "../models/joinResult";
import { compileObjectives } from "./compileObjectives.engine";

export function joinGameEngine(
  state: GameState,
  playerId: number | string,
  nickname: string,
  avatarUrl: string | null,
  role: "PLAYER" | "SPECTATOR"
): JoinResult {

  // Rule 1: cannot join twice - normalize IDs to strings before comparison
  const playerIdStr = String(playerId);
  if (
    state.players.some(p => String(p.id) === playerIdStr) ||
    state.spectators.some(s => String(s.id) === playerIdStr)
  ) {
    return { ok: false, error: JoinError.PLAYER_ALREADY_JOINED };
  }

  // Rule 2: joining as PLAYER after start forbidden
  if (role === "PLAYER" && state.phase !== "LOBBY") {
    return { ok: false, error: JoinError.GAME_ALREADY_STARTED };
  }

  // Rule 3: max players
  if (role === "PLAYER" && state.players.length >= state.rules.maxPlayers) {
    return { ok: false, error: JoinError.GAME_FULL };
  }

  if (role === "SPECTATOR" && !state.rules.allowSpectators) {
    return { ok: false, error: JoinError.SPECTATORS_NOT_ALLOWED };
  }

  // Apply join
  if (role === "PLAYER") {

    const availableSlot = state.level.startingPoints.find(
      sp => !state.players.some(p => p.slotId === sp.slotId)
    ) ?? { slotId: `P${state.players.length + 1}`, x: 0, y: 0 };

    state.players.push({
      id: playerId,
      slotId: availableSlot.slotId,
      name: nickname,
      avatarUrl,
      x: availableSlot.x,
      y: availableSlot.y,
      hasMoved: false,
      skipsLeft: 3,
      totalMoves: 0,
    });

    // Initialize player progress
    const firstCollectible = state.level.collectibles?.find(
      c => c.ownerSlotId === availableSlot.slotId
    );
    state.playerProgress[playerId] = {
      collectedItems: [],
      currentCollectibleId: firstCollectible?.id, 
      objectives: compileObjectives(state.level, state.rules).map(obj => {
        if (obj.type === "RETURN_HOME") {
          return { ...obj, targetX: availableSlot.x, targetY: availableSlot.y };
        }
        return obj;
      }),
    };

    return { ok: true, role: "PLAYER" };
  } else {
    // Spectator
    state.spectators.push({ id: playerId, name: nickname });
    return { ok: true, role: "SPECTATOR" };
  }
}