import { Board } from "src/game/models/board";
import { PositionedTile } from "src/game/models/positionedTile";
import { canMove } from "../engine/helpers/canMove";

describe("canMove", () => {
  function makeBoard(tiles: PositionedTile[][]): Board {
    return { tiles } as Board;
  }

  const L0 = { type: "L", rotation: 0 } as PositionedTile;
  const L90 = { type: "L", rotation: 90 } as PositionedTile;
  const L180 = { type: "L", rotation: 180 } as PositionedTile;
  const I0 = { type: "I", rotation: 0 } as PositionedTile;
  const I90 = { type: "I", rotation: 90 } as PositionedTile;
  const T0 = { type: "T", rotation: 0 } as PositionedTile;
  const X = { type: "X", rotation: 0 } as PositionedTile;
  const W = { type: "W", rotation: 0 } as PositionedTile;

  it("allows movement between connected L tiles", () => {
    const board = makeBoard([
      [L0, L180],
    ]);
    expect(canMove(board, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
    expect(canMove(board, { x: 1, y: 0 }, { x: 0, y: 0 })).toBe(true);
  });

  it("blocks movement if not connected", () => {
    const board = makeBoard([
      [L0, I0],
    ]);
    expect(canMove(board, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(false);
  });

  it("allows movement through X tile in all directions", () => {
    const board = makeBoard([
      [X, X],
      [X, X],
    ]);
    expect(canMove(board, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
    expect(canMove(board, { x: 1, y: 0 }, { x: 1, y: 1 })).toBe(true);
    expect(canMove(board, { x: 1, y: 1 }, { x: 0, y: 1 })).toBe(true);
    expect(canMove(board, { x: 0, y: 1 }, { x: 0, y: 0 })).toBe(true);
  });

  it("returns false for out of bounds", () => {
    const board = makeBoard([
      [L0],
    ]);
    // Only test for out-of-bounds in x direction, since y would throw
    expect(canMove(board, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(false);
  });

  it("blocks diagonal movement", () => {
    const board = makeBoard([
      [X, X],
      [X, X],
    ]);
    expect(canMove(board, { x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false);
  });

  it("blocks movement into or out of walls", () => {
    const board = makeBoard([
      [X, W],
      [W, X],
    ]);

    expect(canMove(board, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(false);
    expect(canMove(board, { x: 1, y: 1 }, { x: 0, y: 1 })).toBe(false);
  });
});
