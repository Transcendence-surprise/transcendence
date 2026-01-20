import { GameState } from "../models/state";
import { JoinResult, JoinError } from "../models/joinResult";

export function joinGameEngine(
  state: GameState,
  playerId: string,
  role: "PLAYER" | "SPECTATOR"
): JoinResult {

  console.log("JOIN ENGINE CALLED", {
    playerId,
    role,
    playersBefore: state.players.map(p => p.id),
    spectatorsBefore: state.spectators.map(s => s.id),
  });

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

    console.log("ADDING PLAYER", {
      playerId,
      spawnIndex: state.players.length,
    });

    const spawnIndex = state.players.length;
    const spawn = state.level.startingPoints[spawnIndex] ?? { x: 0, y: 0 };

    state.players.push({
      id: playerId,
      x: spawn.x,
      y: spawn.y,
      hasMoved: false,
    });

    // Initialize player progress
    const firstCollectible = state.level.collectibles?.find(c => c.ownerId === playerId);
    state.playerProgress[playerId] = {
      collectedItems: [],
      currentCollectibleId: firstCollectible?.id, 
      objectives: state.level.objectives.map(obj => ({
        type: obj.type,
        done: false,
        progress: obj.type === "COLLECT_N" ? 0 : undefined,
      })),
    };

    // Set first player turn if lobby was empty
    // if (state.players.length === 1) {
    //   state.currentPlayerIndex = 0;
    //   state.currentPlayerId = playerId;
    // }
    console.log("STATE AFTER JOIN", {
      playersAfter: state.players.map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
      })),
      currentPlayerId: state.currentPlayerId,
      currentPlayerIndex: state.currentPlayerIndex,
    });
    return { ok: true, role: "PLAYER" };
  } else {
    // Spectator
    state.spectators.push({ id: playerId });
    return { ok: true, role: "SPECTATOR" };
  }
}