// src/game/engine/multiplayerGames.engine.ts
import { GameState } from "../models/state";
import { MultiGame } from "../models/gameInfo";

export function getMultiplayerGames(gamesMap: Map<string, GameState>): MultiGame[] {
  const multiGames: MultiGame[] = [];

  for (const [gameId, state] of gamesMap.entries()) {
    // Only multiplayer games, single player is ignored
    if (state.rules.mode !== "MULTI") continue;
    if (state.phase === "END") continue;

    multiGames.push({
      id: gameId,
      hostId: state.hostId,
      hostName: state.hostName,        
      phase: state.phase as "LOBBY" | "PLAY",
      maxPlayers: state.rules.maxPlayers || 2,              // default to 2 if undefined
      joinedPlayers: state.players.length,
      allowSpectators: state.rules.allowSpectators ?? false, // default false
      collectiblesPerPlayer: state.rules.collectiblesPerPlayer || 1, // default 1
    });
  }

  return multiGames;
}
