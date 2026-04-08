import { advanceTurn } from "../engine/helpers/turnHandler";
import { GameState, PlayerState } from "src/game/models/state";

describe("advanceTurn", () => {
  function makePlayer(id: number | string, overrides: Partial<PlayerState> = {}): PlayerState {
    return {
      id,
      slotId: `P${id}`,
      name: `Player${id}`,
      x: 0,
      y: 0,
      hasMoved: true,
      skipsLeft: 0,
      totalMoves: 0,
      ...overrides,
    };
  }

  function makeState({ players, currentPlayerIndex = 0, requiresBoardActionPerTurn = false }: any): GameState {
    return {
      levelId: "L1",
      level: { id: "L1", objectives: [], startingPoints: [{ slotId: "P1", x: 0, y: 0 }] } as any,
      phase: "PLAY",
      hostId: 1,
      hostName: "host",
      players,
      spectators: [],
      rules: { mode: "MULTI", maxPlayers: players.length, allowSpectators: false, requiresBoardActionPerTurn, fixedCorners: false },
      board: { width: 1, height: 1, tiles: [[{} as any]] },
      currentPlayerIndex,
      currentPlayerId: players[currentPlayerIndex]?.id,
      moveStartedAt: undefined,
      lastBoardAction: undefined,
      boardActionsPending: false,
      turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
      playerProgress: {},
      gameEnded: false,
    } as GameState;
  }

  it("advances to the next player and resets flags", () => {
    const players = [makePlayer(1), makePlayer(2)];
    const state = makeState({ players, currentPlayerIndex: 0 });
    advanceTurn(state);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.currentPlayerId).toBe(2);
    expect(players[0].hasMoved).toBe(false);
    expect(players[1].hasMoved).toBe(false);
    expect(typeof state.moveStartedAt).toBe("number");
  });

  it("wraps around to first player after last", () => {
    const players = [makePlayer(1), makePlayer(2)];
    const state = makeState({ players, currentPlayerIndex: 1 });
    advanceTurn(state);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.currentPlayerId).toBe(1);
  });

  it("sets boardActionsPending based on rules", () => {
    const players = [makePlayer(1), makePlayer(2)];
    const state = makeState({ players, currentPlayerIndex: 0, requiresBoardActionPerTurn: true });
    advanceTurn(state);
    expect(state.boardActionsPending).toBe(true);
    const state2 = makeState({ players, currentPlayerIndex: 0, requiresBoardActionPerTurn: false });
    advanceTurn(state2);
    expect(state2.boardActionsPending).toBe(false);
  });

  it("does nothing if no players", () => {
    const state = makeState({ players: [] });
    advanceTurn(state);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.currentPlayerId).toBeUndefined();
  });
});
