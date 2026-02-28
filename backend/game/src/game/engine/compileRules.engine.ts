// engine/rules.ts
import { GameSettings, GameRules } from "../models/state";

export function compileRules(settings: GameSettings): GameRules {
  if (settings.mode === "SINGLE") {
    return {
      mode: "SINGLE",
      maxPlayers: 1,
      allowSpectators: settings.allowSpectators ?? false,

      requiresBoardActionPerTurn: false,
      fixedCorners: false,
    };
  }

  return {
    mode: "MULTI",
    maxPlayers: settings.maxPlayers,
    allowSpectators: settings.allowSpectators,

    collectiblesPerPlayer: settings.collectiblesPerPlayer ?? 5,

    requiresBoardActionPerTurn: true,
    fixedCorners: true,
    boardSize: settings.boardSize,
  };
}
