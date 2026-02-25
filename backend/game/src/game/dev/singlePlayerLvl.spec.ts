import s01Map from "../levels/01.map";
import { Puzzle01Meta } from "../levels/01.meta";
import { createSingleplayerLevel } from "../factories/singleLevel.factory";
import { createGameState } from "../factories/gameState.factory";

describe("Singleplayer level and game state", () => {
  let level: ReturnType<typeof createSingleplayerLevel>;
  let gameState: ReturnType<typeof createGameState>;

  beforeAll(() => {
    level = createSingleplayerLevel(s01Map, Puzzle01Meta);
    gameState = createGameState(level);
  });

  it("creates the level correctly", () => {
    expect(level).toBeDefined();
    expect(level.id).toBe(Puzzle01Meta.id);
    expect(level.startingPoints.length).toBe(1);
    expect(level.collectibles).toBeInstanceOf(Array);
    expect(level.objectives).toBeInstanceOf(Array);
  });

  it("initializes the game state correctly", () => {
    expect(gameState.levelId).toBe(level.id);
    expect(gameState.players.length).toBe(1);
    const player = gameState.players[0];
    expect(player.x).toBe(level.startingPoints[0].x);
    expect(player.y).toBe(level.startingPoints[0].y);
    expect(gameState.phase).toBe("LOBBY");
  });

  it("collectibles are mapped to tiles", () => {
    (level.collectibles ?? []).forEach(c => {
      const tile = level.board.tiles[c.y][c.x];
      expect(tile.collectableId).toBe(c.id);
    });
  });
});