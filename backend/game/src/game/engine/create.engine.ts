import { GameSettings, GameState, PlayerState } from '../models/state';
import { createGameState } from '../factories/gameState.factory';
import { getSingleplayerLevelById } from '../factories/singleLevel.factory';
import { createMultiplayerLevel } from '../factories/multiLevel.factory';
import { compileRules } from "./compileRules.engine";


export function createGame(
  hostId: number,
  nickname: string,
  settings: GameSettings
): GameState {

  // Create the level
  const level =
    settings.mode === "SINGLE"
      ? getSingleplayerLevelById(settings.levelId ?? "puzzle-01")
      : createMultiplayerLevel(settings);
  // Create base state
  const state = createGameState(level);

  // Compile and attach rules
  state.rules = compileRules(settings);

  // Single-player: inject host into slot
  if (settings.mode === "SINGLE") {
    const hostPlayer = state.players[0];
    hostPlayer.id = hostId;
    hostPlayer.name = nickname;

    state.hostId = hostId;
    state.hostName = nickname;
    console.log(`${state.hostName} created new game!`);
    state.currentPlayerIndex = 0;
    state.currentPlayerId = hostId;

    state.playerProgress[hostId] = {
      collectedItems: [],
      currentCollectibleId: level.collectibles?.[0]?.id,
      objectives: level.objectives.map(obj => ({
        type: obj.type,
        done: false,
        progress: obj.type === "COLLECT_ALL" ? 0 : undefined,
      })),
    };

    state.phase = "PLAY";
    return state;
  }

  // Multiplayer: push host as first player
  const spawn = level.startingPoints[0] ?? { x: 0, y: 0, slotId: "P1" };

  state.players.push({
    id: hostId,
    slotId: spawn.slotId,
    name: nickname,
    x: spawn.x,
    y: spawn.y,
    hasMoved: false,
  });

  state.hostId = hostId;
  state.hostName = nickname;
  console.log(`${state.hostName} created new game!`);
  state.currentPlayerIndex = 0;
  state.currentPlayerId = hostId;

  // Initialize host progress
  const firstCollectible = level.collectibles?.find(c => c.ownerSlotId === spawn.slotId);
  state.playerProgress[hostId] = {
    collectedItems: [],
    currentCollectibleId: firstCollectible?.id,
    objectives: level.objectives.map(obj => ({
      type: obj.type,
      done: false,
      progress: obj.type === "COLLECT_N" || obj.type === "COLLECT_ALL" ? 0 : undefined,
    })),
  };

  // Final state setup
  state.spectators = [];
  state.phase = "LOBBY";
  
  return state;
}
