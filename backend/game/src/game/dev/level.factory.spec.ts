import { createSingleplayerLevel } from '../factories/singleLevel.factory';
import s01Map from '../levels/01.map';
import { Puzzle01Meta } from '../levels/01.meta';
import { createTile } from '../factories/tile.factory';

describe('createSingleplayerLevel', () => {
  it('should create a level with correct dimensions', () => {
    const level = createSingleplayerLevel(s01Map, Puzzle01Meta);
    expect(level.board.width).toBe(s01Map[0].length);
    expect(level.board.height).toBe(s01Map.length);
  });

  it('should parse all tiles correctly', () => {
    const level = createSingleplayerLevel(s01Map, Puzzle01Meta);

    level.board.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const expected = createTile(s01Map[y][x], x, y);
        expect(tile.type).toBe(expected.type);
        expect(tile.rotation).toBe(expected.rotation);
        expect(tile.x).toBe(x);
        expect(tile.y).toBe(y);
      });
    });
  });

  it('should include all starting points correctly', () => {
    const level = createSingleplayerLevel(s01Map, Puzzle01Meta);
    expect(level.startingPoints.length).toBe(Puzzle01Meta.startingPoints.length);

    level.startingPoints.forEach((sp, index) => {
      const metaSP = Puzzle01Meta.startingPoints[index];
      expect(sp.slotId).toBe(metaSP.slotId);
      expect(sp.x).toBe(metaSP.x);
      expect(sp.y).toBe(metaSP.y);
    });
  });

  it('should include objectives from meta', () => {
    const level = createSingleplayerLevel(s01Map, Puzzle01Meta);
    expect(level.objectives).toEqual(Puzzle01Meta.objectives);
  });

  it('should initialize collectibles if defined', () => {
    const level = createSingleplayerLevel(s01Map, Puzzle01Meta);

    const collectibles = level.collectibles ?? []; // fallback to empty array

    if (Puzzle01Meta.collectibles) {
      expect(collectibles.length).toBe(Puzzle01Meta.collectibles.length);
      collectibles.forEach((c, i) => {
        expect(c.id).toBe(Puzzle01Meta.collectibles![i].id);
        expect(c.x).toBe(Puzzle01Meta.collectibles![i].x);
        expect(c.y).toBe(Puzzle01Meta.collectibles![i].y);
      });
    } else {
      expect(collectibles).toEqual([]);
    }
  });

  it('should throw an error for empty maps', () => {
    expect(() => createSingleplayerLevel([], Puzzle01Meta))
      .toThrow('Level puzzle-01: map is empty');
  });



});
