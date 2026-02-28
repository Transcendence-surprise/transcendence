import { Level } from "../models/level";
import { GameState, PlayerState } from "../models/state";

export function createGameState(level: Level): GameState {
  const initialPlayers: PlayerState[] =
    level.startingPoints.length === 1
      ? level.startingPoints.map((p, index) => ({
          id: 0, // placeholder, will be filled by host
          slotId: p.slotId ?? `P${index + 1}`, // assign slot if missing
          name: "Player 1",
          x: p.x,
          y: p.y,
          hasMoved: false,
        }))
      : [];  // multiplayer starts empty, host will join later

  return {
    levelId: level.id,
    level,

    phase: "LOBBY",       // default

    hostId: 0,            // temporary placeholder
    hostName: "",

    players: initialPlayers,
    spectators: [],

    rules: {
      mode: level.startingPoints.length === 1 ? "SINGLE" : "MULTI",
      maxPlayers: level.startingPoints.length === 1 ? 1 : level.startingPoints.length,
      allowSpectators: false,
      requiresBoardActionPerTurn: false,
      fixedCorners: false,
    },

    board: structuredClone(level.board),

    currentPlayerIndex: 0,
    currentPlayerId: null,

    lastBoardAction: undefined,

    turnActions: {
      rotateCount: {},
      shiftDone: false,
      swapDone: false,
    },

    playerProgress: {},   // EMPTY

    gameEnded: false,
    boardActionsPending: true,

    collected: Object.fromEntries(
      (level.collectibles ?? []).map(c => [c.id, false])
    ),

    gameResult: undefined,
  };
}