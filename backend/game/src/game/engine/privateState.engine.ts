// src/game/engine/privateState.engine.ts
import { PrivateGameStateResult } from "../models/privatState";
import { GameState } from "../models/state";


export function getPrivateState(
  state: GameState,
  playerId: number | string
): PrivateGameStateResult {

  const progress = state.playerProgress[playerId.toString()];
  const objectives = state.level.objectives.map((o) => JSON.stringify(o));
  const spectatorNames: string[] = state.spectators.map(s => s.id.toString());

  return {
    ok: true,
    state: {
      levelId: state.level.id,
      level: state.level,
      hostName: state.hostName,
      phase: state.phase,
      board: state.board,
      players: state.players,
      currentPlayerId: state.currentPlayerId,
      gameResult: state.gameResult ? { winnerIds: [state.gameResult.winnerId] } : undefined,
      spectators: spectatorNames,
      objectives: objectives,
      gameStartedAt: state.gameStartedAt,
      moveStartedAt: state.moveStartedAt,
      moveLimitPerTurnSec: state.rules.moveLimitPerTurnSec,
      boardActionsPending: state.boardActionsPending,
      playerProgress: progress,
      skipsLeft: state.players.find(p => p.id.toString() === playerId.toString())?.skipsLeft ?? 0,
    }
  };
}
