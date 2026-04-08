
import { collectItemsAlongPath } from "../engine/helpers/collectItem";
import { GameState, PlayerState } from "src/game/models/state";
import { Board } from "src/game/models/board";
import { Level } from "src/game/models/level";
import { Collectible } from "src/game/models/collectible";
import { PositionedTile } from "src/game/models/positionedTile";

describe("collectItemsAlongPath", () => {
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

  function makeState({
    mode = "SINGLE",
    tiles = [[]] as PositionedTile[][],
    collectibles = [] as Collectible[],
    playerProgress = {}
  }: {
    mode?: "SINGLE" | "MULTI",
    tiles?: PositionedTile[][],
    collectibles?: Collectible[],
    playerProgress?: any
  } = {}): GameState {
    return {
      levelId: "L1",
      level: {
        id: "L1",
        objectives: [],
        board: { width: 2, height: 1, tiles: tiles as any },
        collectibles: collectibles as any,
        startingPoints: [{ slotId: "P1", x: 0, y: 0 }],
      } as Level,
      phase: "PLAY",
      hostId: 1,
      hostName: "host",
      players: [],
      spectators: [],
      rules: { mode, maxPlayers: 1, allowSpectators: false, requiresBoardActionPerTurn: false, fixedCorners: false },
      board: { width: 2, height: 1, tiles: tiles as any },
      currentPlayerIndex: 0,
      currentPlayerId: 1,
      moveStartedAt: undefined,
      lastBoardAction: undefined,
      boardActionsPending: false,
      turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
      playerProgress,
      gameEnded: false,
    } as GameState;
  }

  it("collects all items in SINGLE mode", () => {
    const tiles = [
      [makeTile({ collectableId: "a" }), makeTile({ collectableId: "b" })],
    ];
    const state = makeState({ mode: "SINGLE", tiles });
    const player = makePlayer();
    const path = [ { x: 0, y: 0 }, { x: 1, y: 0 } ];
    const result = collectItemsAlongPath(state, player, path);
    expect(result).toEqual(["a", "b"]);
    expect(tiles[0][0].collectableId).toBeUndefined();
    expect(tiles[0][1].collectableId).toBeUndefined();
  });

  it("collects only owned and targeted items in MULTI mode", () => {
    const tiles = [
      [makeTile({ collectableId: "a" }), makeTile({ collectableId: "b" })],
    ];
    const collectibles: Collectible[] = [
      { id: "a", x: 0, y: 0, ownerSlotId: "P1" },
      { id: "b", x: 1, y: 0, ownerSlotId: "P2" },
    ];
    const playerProgress = {
      "1": { collectedItems: [], currentCollectibleId: "a", objectives: [] },
    };
    const state = makeState({ mode: "MULTI", tiles, collectibles, playerProgress });
    const player = makePlayer();
    const path = [ { x: 0, y: 0 }, { x: 1, y: 0 } ];
    const result = collectItemsAlongPath(state, player, path);
    expect(result).toEqual(["a"]);
    expect(tiles[0][0].collectableId).toBeUndefined();
    expect(tiles[0][1].collectableId).toBe("b");
  });

  it("skips tiles with no collectableId", () => {
    const tiles = [
      [makeTile(), makeTile({ collectableId: "b" })],
    ];
    const state = makeState({ mode: "SINGLE", tiles });
    const player = makePlayer();
    const path = [ { x: 0, y: 0 }, { x: 1, y: 0 } ];
    const result = collectItemsAlongPath(state, player, path);
    expect(result).toEqual(["b"]);
  });

  it("returns empty if nothing collected", () => {
    const tiles = [
      [makeTile(), makeTile()],
    ];
    const state = makeState({ mode: "SINGLE", tiles });
    const player = makePlayer();
    const path = [ { x: 0, y: 0 }, { x: 1, y: 0 } ];
    const result = collectItemsAlongPath(state, player, path);
    expect(result).toEqual([]);
  });
});
