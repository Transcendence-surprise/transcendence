import { compileObjectives } from "../engine/compileObjectives.engine";
import { processPlayerAction } from "../engine/playerAction.engine";
import { GameState, PlayerState } from "../../game/models/state";
import { PlayerAction, PlayerActionError } from "../../game/models/playerAction";
import { PositionedTile } from "../../game/models/positionedTile";
import { Collectible } from "../../game/models/collectible";

describe("processPlayerAction", () => {
  function makePlayer(id: number | string, overrides: Partial<PlayerState> = {}): PlayerState {
    return {
      id,
      slotId: `P${id}`,
      name: `Player${id}`,
      x: 0,
      y: 0,
      hasMoved: false,
      skipsLeft: 0,
      totalMoves: 0,
      ...overrides,
    };
  }

  function makeTile(overrides: Partial<PositionedTile> = {}): PositionedTile {
    return {
      type: "L",
      rotation: 0,
      x: 0,
      y: 0,
      ...overrides,
    };
  }

  function makeState({ players, playerProgress, boardTiles, collectibles = [], mode = "SINGLE", currentPlayerIndex = 0, phase = "PLAY", exitPoints, constraints }: any): GameState {
    return {
      levelId: "L1",
      level: { id: "L1", objectives: [], collectibles, startingPoints: [{ slotId: "P1", x: 0, y: 0 }], exitPoints, constraints } as any,
      phase,
      hostId: 1,
      hostName: "host",
      players,
      spectators: [],
      rules: { mode, maxPlayers: players.length, allowSpectators: false, requiresBoardActionPerTurn: false, fixedCorners: false },
      board: { width: boardTiles[0].length, height: boardTiles.length, tiles: boardTiles },
      currentPlayerIndex,
      currentPlayerId: players[currentPlayerIndex]?.id,
      moveStartedAt: undefined,
      lastBoardAction: undefined,
      boardActionsPending: false,
      turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
      playerProgress,
      gameEnded: false,
    } as GameState;
  }

  it("returns error if no player at current index", () => {
    const state = makeState({ players: [], playerProgress: {}, boardTiles: [[]] });
    const action: PlayerAction = { path: [], skip: false };
    expect(processPlayerAction(state, action)).toEqual({ ok: false, error: PlayerActionError.PLAYER_NOT_FOUND });
  });

  it("returns error if no player progress", () => {
    const players = [makePlayer(1)];
    const state = makeState({ players, playerProgress: {}, boardTiles: [[makeTile()]] });
    const action: PlayerAction = { path: [], skip: false };
    expect(processPlayerAction(state, action)).toEqual({ ok: false, error: PlayerActionError.PLAYER_NOT_FOUND });
  });

  it("returns error if move is invalid", () => {
    const players = [makePlayer(1)];
    const playerProgress = { "1": { collectedItems: [], objectives: [] } };
    const state = makeState({ players, playerProgress, boardTiles: [[makeTile()]] });
    const action: PlayerAction = { path: [{ x: 99, y: 99 }], skip: false };
    expect(processPlayerAction(state, action)).toEqual({ ok: false, error: PlayerActionError.INVALID_ACTION });
  });

  it("accepts skip without validating path", () => {
    const players = [makePlayer(1)];
    const playerProgress = { "1": { collectedItems: [], objectives: [] } };
    const state = makeState({ players, playerProgress, boardTiles: [[makeTile()]] });
    const action: PlayerAction = { path: [], skip: true };

    expect(processPlayerAction(state, action)).toEqual({ ok: true, action });
  });

  it("moves player, collects items, and advances turn", () => {
    const players = [makePlayer(1)];
    const playerProgress = { "1": { collectedItems: [], objectives: [] } };
    // Use I tiles rotated to allow left-right movement
    const tiles = [
      [makeTile({ type: "I", rotation: 90 }), makeTile({ type: "I", rotation: 90, collectableId: "a" })],
    ];
    const collectibles: Collectible[] = [{ id: "a", x: 1, y: 0 }];
    const state = makeState({ players, playerProgress, boardTiles: tiles, collectibles });
    const action: PlayerAction = { path: [{ x: 1, y: 0 }], skip: false };
    const result = processPlayerAction(state, action);
    expect(result).toEqual({ ok: true, action });
    expect(players[0].x).toBe(1);
    expect(players[0].y).toBe(0);
    expect(playerProgress["1"].collectedItems).toContain("a");
  });

  it("sets gameEnded and winner if win condition met", () => {
    const players = [makePlayer(1)];
    // 2x2 board, allow right and down movement
    const tiles = [
      [
        makeTile({ type: "T", rotation: 90 }),   // (0,0) UP, RIGHT, DOWN
        makeTile({ type: "T", rotation: 90 }),   // (1,0) LEFT, RIGHT, DOWN
      ],
      [
        makeTile({ type: "T", rotation: 90 }),   // (0,1)
        makeTile({ type: "T", rotation: 270 }),  // (1,1) LEFT, UP, DOWN
      ]
    ];
    // Level with REACH_EXIT objective and exit at (1,1)
    const level = {
      id: "L1",
      objectives: [{ type: "REACH_EXIT" } as const],
      board: { width: 2, height: 2, tiles },
      startingPoints: [{ slotId: "P1", x: 0, y: 0 }],
      exitPoints: [{ x: 1, y: 1 }],
      collectibles: [],
    };
    const playerProgress = {
      "1": {
        collectedItems: [],
        objectives: compileObjectives(level, { mode: "SINGLE", maxPlayers: 1, allowSpectators: false, requiresBoardActionPerTurn: false, fixedCorners: false }),
      },
    };
    const state = makeState({ players, playerProgress, boardTiles: tiles, exitPoints: [{ x: 1, y: 1 }] });
    state.level = level;
    const action: PlayerAction = { path: [{ x: 1, y: 0 }, { x: 1, y: 1 }], skip: false };
    const result = processPlayerAction(state, action);
    expect(result).toEqual({ ok: true, action });
    expect(state.gameEnded).toBe(true);
    expect(state.gameResult?.winnerId).toBe("1");
    expect(state.endReason).toBe("WIN");
    expect(state.phase).toBe("END");
  });

  it("does not end single-player game by maxMoves on player movement", () => {
    const players = [makePlayer(1, { totalMoves: 1 })];
    const playerProgress = { "1": { collectedItems: [], objectives: [{ type: "COLLECT_ALL", done: false }] } };
    const tiles = [[makeTile({ type: "I", rotation: 90 }), makeTile({ type: "I", rotation: 90 })]];
    const collectibles: Collectible[] = [{ id: "still-missing", x: 0, y: 0 }];
    const state = makeState({
      players,
      playerProgress,
      boardTiles: tiles,
      collectibles,
      constraints: { maxMoves: 2 },
      mode: "SINGLE",
    });

    const action: PlayerAction = { path: [{ x: 1, y: 0 }], skip: false };
    const result = processPlayerAction(state, action);

    expect(result).toEqual({ ok: true, action });
    expect(state.phase).toBe("PLAY");
    expect(state.gameEnded).toBe(false);
    expect(state.gameResult).toBeUndefined();
    expect(state.endReason).toBeUndefined();
  });

  it("ends single-player game as loss when level time limit is reached", () => {
    const players = [makePlayer(1)];
    const playerProgress = { "1": { collectedItems: [], objectives: [{ type: "COLLECT_ALL", done: false }] } };
    const tiles = [[makeTile({ type: "I", rotation: 90 }), makeTile({ type: "I", rotation: 90 })]];
    const collectibles: Collectible[] = [{ id: "still-missing", x: 0, y: 0 }];
    const state = makeState({
      players,
      playerProgress,
      boardTiles: tiles,
      collectibles,
      constraints: { levelLimitSec: 1 },
      mode: "SINGLE",
    });
    state.gameStartedAt = Date.now() - 5000;

    const action: PlayerAction = { path: [{ x: 1, y: 0 }], skip: false };
    const result = processPlayerAction(state, action);

    expect(result).toEqual({ ok: true, action });
    expect(state.phase).toBe("END");
    expect(state.gameEnded).toBe(true);
    expect(state.gameResult).toBeUndefined();
    expect(state.endReason).toBe("LOSE_TIME_LIMIT");
  });
});
