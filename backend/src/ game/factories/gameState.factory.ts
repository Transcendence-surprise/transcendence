import { Level } from "../models/level";
import { GameState, PlayerState, PlayerProgress } from "../models/state";
import { LevelObjective } from "../models/objective";

export function createGameState(level: Level): GameState {
  const players: PlayerState[] =
    level.startingPoints.length > 0
      ? level.startingPoints.map(p => ({
          id: p.playerId,
          x: p.x,
          y: p.y,
          hasMoved: false,
        }))
      : [
          {
            id: "P1",
            x: 0,
            y: 0,
            hasMoved: false,
          },
        ]; // fallback

  // Initialize per-player progress
  const playerProgress: Record<string, PlayerProgress> = {};
  for (const p of players) {
    playerProgress[p.id] = {
      collectedItems: [],
      currentCollectibleId: level.collectibles?.[0]?.id,
      objectives: (level.objectives ?? []).map((obj: LevelObjective) => ({
        type: obj.type,
        done: false,
        progress: obj.type === "COLLECT_N" || obj.type === "COLLECT_ALL" ? 0 : undefined,
      })),
    };
  }

  return {
    levelId: level.id,
    level, // full level stored here
    phase: "PLAY",

    rules: {
      mode: "SINGLE",
      maxPlayers: 1,
      allowSpectators: false,
      requiresBoardActionPerTurn: false,
      fixedCorners: false,
    },

    board: structuredClone(level.board),

    players,
    spectators: [],

    currentPlayerIndex: 0,
    currentPlayerId: players[0]?.id ?? null,

    lastBoardAction: undefined,

    turnActions: {
      rotateCount: {},
      shiftDone: false,
      swapDone: false,
    },

    playerProgress,          // <-- objectives now live here
    gameEnded: false,
    boardActionsPending: true,

    collected: Object.fromEntries(
      (level.collectibles ?? []).map(c => [c.id, false])
    ),
  };
}