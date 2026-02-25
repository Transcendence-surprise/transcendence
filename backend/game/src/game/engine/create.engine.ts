import { GameSettings, GameState, PlayerState } from '../models/state';
import { createGameState } from '../factories/gameState.factory';
import { getSingleplayerLevelById } from '../factories/singleLevel.factory';
import { createMultiplayerLevel } from '../factories/multiLevel.factory';
import { compileRules } from "./compileRules.engine";

export function createGame(hostId: number, nickname:string, settings: GameSettings): GameState {

  // Create the level
  const level =
    settings.mode === "SINGLE"
      ? getSingleplayerLevelById(settings.levelId ?? "puzzle-01")
      : createMultiplayerLevel(settings);
  // Initialize game state from level
  const state = createGameState(level);

  // Compile and attach rules
  state.rules = compileRules(settings);

  // Set host info
  state.hostId = hostId;
  state.hostName = nickname;
  state.currentPlayerIndex = 0;
  state.currentPlayerId = hostId;

// Initialize players and progress
if (settings.mode === "SINGLE") {
  const sp: PlayerState = {
    id: hostId,
    name: nickname,
    x: level.startingPoints[0]?.x ?? 0,
    y: level.startingPoints[0]?.y ?? 0,
    hasMoved: false,
  };
  state.players = [sp];

  state.playerProgress[hostId] = {
    collectedItems: [],
    currentCollectibleId: level.collectibles?.[0]?.id, // first collectible
    objectives: level.objectives.map(obj => ({
      type: obj.type,
      done: false,
      progress: obj.type === "COLLECT_ALL" ? 0 : undefined,
    })),
  };
} else {
  // Multiplayer: host joins first player slot
  const start = level.startingPoints[0] ?? { x: 0, y: 0 };
  state.players = [
    {
      id: hostId,
      name: nickname,
      x: start.x,
      y: start.y,
      hasMoved: false,
    },
  ];

  // Assign first collectible of this player if any
  const firstCollectible = level.collectibles?.find(c => c.ownerId === hostId);

  state.playerProgress[hostId] = {
    collectedItems: [],
    currentCollectibleId: firstCollectible?.id, // undefined if none yet
    objectives: level.objectives.map(obj => ({
      type: obj.type,
      done: false,
      progress: obj.type === "COLLECT_N" ? 0 : undefined,
    })),
  };
}

  state.spectators = [];
  state.phase = settings.mode === "SINGLE" ? "PLAY" : "LOBBY";
  
  return state;
}
