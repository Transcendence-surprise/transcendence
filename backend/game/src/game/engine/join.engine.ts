import { GameState } from "../models/state";
import { JoinResult, JoinError } from "../models/joinResult";

export function joinGameEngine(
  state: GameState,
  playerId: number,
  nickname: string,
  role: "PLAYER" | "SPECTATOR"
): JoinResult {

  // Rule 1: cannot join twice
  if (
    state.players.some(p => p.id === playerId) ||
    state.spectators.some(s => s.id === playerId)
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
      x: availableSlot.x,
      y: availableSlot.y,
      hasMoved: false,
    });

    // Initialize player progress
    const firstCollectible = state.level.collectibles?.find(
      c => c.ownerSlotId === availableSlot.slotId
    );
    state.playerProgress[playerId] = {
      collectedItems: [],
      currentCollectibleId: firstCollectible?.id, 
      objectives: state.level.objectives.map(obj => ({
        type: obj.type,
        done: false,
        progress: obj.type === "COLLECT_N" ? 0 : undefined,
      })),
    };

    return { ok: true, role: "PLAYER" };
  } else {
    // Spectator
    state.spectators.push({ id: playerId });
    return { ok: true, role: "SPECTATOR" };
  }
}