import { validatePlayerAction } from "../engine/helpers/move.validator";
import { GameState, PlayerState } from "src/game/models/state";
import { PlayerAction } from "src/game/models/playerAction";
import { PositionedTile } from "src/game/models/positionedTile";
import { Board } from "src/game/models/board";

describe("validatePlayerAction", () => {
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

  function makeTile(overrides: Partial<PositionedTile> = {}): PositionedTile {
    return {
      type: "L",
      rotation: 0,
      x: 0,
      y: 0,
      ...overrides,
    };
  }

  function makeBoard(tiles: PositionedTile[][]): Board {
    return { width: tiles[0].length, height: tiles.length, tiles };
  }

  function makeState({ mode = "SINGLE", board, player, currentPlayerId = 1, maxMoves, constraints = {}, hasMoved = false } : any = {}): GameState {
    return {
      levelId: "L1",
      level: { id: "L1", objectives: [], board, collectibles: [], startingPoints: [{ slotId: "P1", x: 0, y: 0 }], constraints } as any,
      phase: "PLAY",
      hostId: 1,
      hostName: "host",
      players: [player],
      spectators: [],
      rules: { mode, maxPlayers: 1, allowSpectators: false, requiresBoardActionPerTurn: false, fixedCorners: false },
      board,
      currentPlayerIndex: 0,
      currentPlayerId,
      moveStartedAt: undefined,
      lastBoardAction: undefined,
      boardActionsPending: false,
      turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
      playerProgress: {},
      gameEnded: false,
    } as GameState;
  }

  it("returns valid for a simple move in bounds", () => {
    // Use I tiles rotated to allow left-right movement
    const tiles = [
      [makeTile({ type: "I", rotation: 90 }), makeTile({ type: "I", rotation: 90 })],
    ];
    const board = makeBoard(tiles);
    const player = makePlayer();
    const state = makeState({ board, player });
    const action: PlayerAction = { path: [ { x: 1, y: 0 } ] };
    expect(validatePlayerAction(state, player, action)).toEqual({ valid: true });
  });

  it("returns invalid if not player's turn in MULTI", () => {
    const tiles = [ [makeTile(), makeTile()] ];
    const board = makeBoard(tiles);
    const player = makePlayer();
    const state = makeState({ mode: "MULTI", board, player, currentPlayerId: 2 });
    const action: PlayerAction = { path: [ { x: 1, y: 0 } ] };
    expect(validatePlayerAction(state, player, action)).toEqual({ valid: false, reason: "Not your turn" });
  });

  it("returns invalid if player already moved", () => {
    const tiles = [ [makeTile(), makeTile()] ];
    const board = makeBoard(tiles);
    const player = makePlayer({ hasMoved: true });
    const state = makeState({ board, player });
    const action: PlayerAction = { path: [ { x: 1, y: 0 } ] };
    expect(validatePlayerAction(state, player, action)).toEqual({ valid: false, reason: "Player already moved this turn" });
  });

  it("returns invalid if move is out of bounds", () => {
    const tiles = [ [makeTile(), makeTile()] ];
    const board = makeBoard(tiles);
    const player = makePlayer();
    const state = makeState({ board, player });
    const action: PlayerAction = { path: [ { x: 2, y: 0 } ] };
    expect(validatePlayerAction(state, player, action)).toEqual({ valid: false, reason: "Move out of bounds" });
  });

  it("returns invalid if path is blocked by walls", () => {
    // L0 only opens up/right, L90 only opens right/down, so no left-right connection
    const tiles = [
      [makeTile({ type: "L", rotation: 0 }), makeTile({ type: "L", rotation: 90 })],
    ];
    const board = makeBoard(tiles);
    const player = makePlayer();
    const state = makeState({ board, player });
    const action: PlayerAction = { path: [ { x: 1, y: 0 } ] };
    expect(validatePlayerAction(state, player, action)).toEqual({ valid: false, reason: "Path blocked by walls" });
  });
});
