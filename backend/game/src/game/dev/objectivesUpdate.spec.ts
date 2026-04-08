import { updatePlayerObjectives } from "../engine/helpers/objectivesUpdate";
import { GameState, PlayerState } from "src/game/models/state";
import { ObjectiveStatus } from "src/game/models/objective";

describe("updatePlayerObjectives", () => {
  function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
    return {
      id: 1,
      slotId: "P1",
      name: "TestPlayer",
      x: 0,
      y: 0,
      hasMoved: false,
      skipsLeft: 0,
      totalMoves: 0,
      ...overrides,
    };
  }

  function makeState(progress: any, level: any = {}): GameState {
    return {
      levelId: "L1",
      level: { id: "L1", objectives: [], collectibles: [], ...level, startingPoints: [{ slotId: "P1", x: 0, y: 0 }] },
      phase: "PLAY",
      hostId: 1,
      hostName: "host",
      players: [],
      spectators: [],
      rules: { mode: "SINGLE", maxPlayers: 1, allowSpectators: false, requiresBoardActionPerTurn: false, fixedCorners: false },
      board: { width: 1, height: 1, tiles: [[{} as any]] },
      currentPlayerIndex: 0,
      currentPlayerId: 1,
      moveStartedAt: undefined,
      lastBoardAction: undefined,
      boardActionsPending: false,
      turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
      playerProgress: { "1": progress },
      gameEnded: false,
    } as GameState;
  }

  it("marks COLLECT_ALL as done when enough items collected", () => {
    const obj: ObjectiveStatus = { type: "COLLECT_ALL", done: false, amount: 2 };
    const progress = { collectedItems: ["a", "b"], objectives: [obj] };
    const state = makeState(progress, { collectibles: [{}, {}] });
    const player = makePlayer();
    updatePlayerObjectives(state, player);
    expect(obj.done).toBe(true);
    expect(obj.progress).toBe(2);
  });

  it("marks COLLECT_N as done when enough items collected", () => {
    const obj: ObjectiveStatus = { type: "COLLECT_N", done: false, amount: 1 };
    const progress = { collectedItems: ["a"], objectives: [obj] };
    const state = makeState(progress);
    const player = makePlayer();
    updatePlayerObjectives(state, player);
    expect(obj.done).toBe(true);
    expect(obj.progress).toBe(1);
  });

  it("marks RETURN_HOME as done when at target", () => {
    const obj: ObjectiveStatus = { type: "RETURN_HOME", done: false, targetX: 2, targetY: 3 };
    const progress = { collectedItems: [], objectives: [obj] };
    const state = makeState(progress);
    const player = makePlayer({ x: 2, y: 3 });
    updatePlayerObjectives(state, player);
    expect(obj.done).toBe(true);
  });

  it("marks REACH_EXIT as done when at exit", () => {
    const obj: ObjectiveStatus = { type: "REACH_EXIT", done: false };
    const progress = { collectedItems: [], objectives: [obj] };
    const state = makeState(progress, { exitPoints: [{ x: 5, y: 5 }] });
    const player = makePlayer({ x: 5, y: 5 });
    updatePlayerObjectives(state, player);
    expect(obj.done).toBe(true);
  });

  it("does nothing if no progress for player", () => {
    const state = makeState(undefined);
    const player = makePlayer();
    expect(() => updatePlayerObjectives(state, player)).not.toThrow();
  });
});
