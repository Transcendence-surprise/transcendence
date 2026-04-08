import { applyBoardAction } from "../logic/boardMove.logic";
import { Board } from "src/game/models/board";
import { PositionedTile } from "src/game/models/positionedTile";
import { BoardAction } from "src/game/models/boardAction";

describe("applyBoardAction", () => {
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

  it("rotates a tile", () => {
    const tile = makeTile({ rotation: 0 });
    const board = makeBoard([[tile]]);
    const action: BoardAction = { type: "ROTATE_TILE", x: 0, y: 0 };
    applyBoardAction(board, action);
    expect(tile.rotation).toBe(90);
  });

  it("swaps two tiles", () => {
    const tileA = makeTile({ x: 0, y: 0 });
    const tileB = makeTile({ x: 1, y: 0 });
    const board = makeBoard([[tileA, tileB]]);
    const action: BoardAction = { type: "SWAP_TILES", x1: 0, y1: 0, x2: 1, y2: 0 };
    applyBoardAction(board, action);
    expect(board.tiles[0][0]).toBe(tileB);
    expect(board.tiles[0][1]).toBe(tileA);
    expect(tileA.x).toBe(1);
    expect(tileB.x).toBe(0);
  });

  it("shifts a row left", () => {
    const tileA = makeTile({ x: 0, y: 0 });
    const tileB = makeTile({ x: 1, y: 0 });
    const board = makeBoard([[tileA, tileB]]);
    const action: BoardAction = { type: "SHIFT", axis: "ROW", index: 0, direction: "LEFT" };
    applyBoardAction(board, action);
    expect(board.tiles[0][0]).toBe(tileB);
    expect(board.tiles[0][1]).toBe(tileA);
    expect(tileA.x).toBe(1);
    expect(tileB.x).toBe(0);
  });

  it("shifts a column down", () => {
    const tileA = makeTile({ x: 0, y: 0 });
    const tileB = makeTile({ x: 0, y: 1 });
    const board = makeBoard([[tileA], [tileB]]);
    const action: BoardAction = { type: "SHIFT", axis: "COL", index: 0, direction: "DOWN" };
    applyBoardAction(board, action);
    expect(board.tiles[0][0]).toBe(tileB);
    expect(board.tiles[1][0]).toBe(tileA);
    expect(tileA.y).toBe(1);
    expect(tileB.y).toBe(0);
  });
});
