//src/game/engine/create.engine.ts
import { GameSettings, GameState } from '../models/state';
import { createGameState } from '../factories/gameState.factory';
import { getSingleplayerLevelById } from '../factories/singleLevel.factory';
import { createMultiplayerLevel } from '../factories/multiLevel.factory';
import { compileRules } from "./compileRules.engine";
import { compileObjectives } from "./compileObjectives.engine";
import { GamePhase } from '@transcendence/db-entities';

export function createGame(
  hostId: number | string,
  nickname: string,
  avatarUrl: string | null,
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

  // Determine starting point for host player based on level config (or default to P1) 
  const spawn = level.startingPoints[0] ?? { x: 0, y: 0, slotId: "P1" };


  // Determine starting point for host player based on level config (or default to P1) 
  // Override player creation for SINGLE mode to reuse the existing player object in the state
  if (settings.mode === "SINGLE") {
    // Reuse the existing initial player
    const hostPlayer = state.players[0];
    hostPlayer.id = hostId;
    hostPlayer.name = nickname;
    hostPlayer.avatarUrl = avatarUrl;
    hostPlayer.x = spawn.x;
    hostPlayer.y = spawn.y;
    hostPlayer.slotId = spawn.slotId;
    hostPlayer.hasMoved = false;
    hostPlayer.skipsLeft = 0;
    hostPlayer.totalMoves = 0;

    state.hostId = hostId;
    state.hostName = nickname;
    state.currentPlayerIndex = 0;
    state.currentPlayerId = hostPlayer.id;

    // Initialize host progress
    const firstCollectible = level.collectibles?.find(c => c.ownerSlotId === spawn.slotId);
    state.playerProgress[hostId.toString()] = {
      collectedItems: [],
      currentCollectibleId: firstCollectible?.id,
      objectives: compileObjectives(state.level, state.rules).map(obj => {
        if (obj.type === "RETURN_HOME") {
          return { ...obj, targetX: spawn.x, targetY: spawn.y };
        }
        return obj;
      }),
    };

    state.phase = GamePhase.PLAY;
    state.gameStartedAt = Date.now();
    state.spectators = [];
    return state;
  }
  // For MULTI mode, create the host player and add to state
  const hostPlayer = {
    id: hostId,
    slotId: spawn.slotId,
    name: nickname,
    avatarUrl,
    x: spawn.x,
    y: spawn.y,
    hasMoved: false,
    skipsLeft: settings.mode === "MULTI" ? 3 : 0,
    totalMoves: 0,
  };
  state.players.push(hostPlayer);

  state.hostId = hostId;
  state.hostName = nickname;
  state.currentPlayerIndex = 0;
  state.currentPlayerId = hostPlayer.id;

  // Initialize host progress
  const firstCollectible = level.collectibles?.find(c => c.ownerSlotId === spawn.slotId);

  state.playerProgress[hostId.toString()] = {
    collectedItems: [],
    currentCollectibleId: firstCollectible?.id,
    objectives: compileObjectives(state.level, state.rules).map(obj => {
      if (obj.type === "RETURN_HOME") {
        return { ...obj, targetX: spawn.x, targetY: spawn.y };
      }
      return obj;
    }),
  };

  // Final state setup
  state.spectators = [];
  state.phase = GamePhase.LOBBY;
  
  return state;
}
