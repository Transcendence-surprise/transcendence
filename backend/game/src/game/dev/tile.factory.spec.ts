import { parseTile, createTile } from '../factories/tile.factory';

describe('Tile Factory', () => {
  /* ======================================================
   * parseTile
   * ====================================================== */
  describe('parseTile', () => {
    it('parses all valid tile types and rotations', () => {
      const cases = [
        { token: 'L0', type: 'L', rotation: 0 },
        { token: 'L3', type: 'L', rotation: 270 },
        { token: 'I0', type: 'I', rotation: 0 },
        { token: 'I2', type: 'I', rotation: 180 },
        { token: 'T1', type: 'T', rotation: 90 },
        { token: 'X3', type: 'X', rotation: 270 },
      ];

      cases.forEach(({ token, type, rotation }) => {
        const tile = parseTile(token, 0, 0);

        expect(tile.type).toBe(type);
        expect(tile.rotation).toBe(rotation);
        expect(tile.x).toBe(0);
        expect(tile.y).toBe(0);
      });
    });

    it('assigns correct coordinates', () => {
      const tile = parseTile('L1', 5, 7);

      expect(tile.x).toBe(5);
      expect(tile.y).toBe(7);
    });

    it('throws for invalid tile type', () => {
      expect(() => parseTile('Z0', 0, 0)).toThrow('Invalid tile type');
      expect(() => parseTile('A2', 0, 0)).toThrow('Invalid tile type');
    });

    it('throws for invalid rotation index', () => {
      expect(() => parseTile('L5', 0, 0)).toThrow('Invalid tile rotation');
      expect(() => parseTile('T-1', 0, 0)).toThrow('Invalid tile rotation');
      expect(() => parseTile('I9', 0, 0)).toThrow('Invalid tile rotation');
    });

    it('throws for empty or too-short token', () => {
      expect(() => parseTile('', 0, 0)).toThrow();
      expect(() => parseTile('L', 0, 0)).toThrow();
    });
  });

  /* ======================================================
   * createTile
   * ====================================================== */
  describe('createTile', () => {
    it('creates a tile with correct type, rotation, and position', () => {
      const tile = createTile('T2', 3, 4);

      expect(tile).toMatchObject({
        type: 'T',
        rotation: 180,
        x: 3,
        y: 4,
      });
    });

    it('propagates errors from parseTile', () => {
      expect(() => createTile('Z0', 0, 0)).toThrow('Invalid tile type');
      expect(() => createTile('L8', 0, 0)).toThrow('Invalid tile rotation');
    });
  });

  /* ======================================================
   * Map → tiles (integration-style test)
   * ====================================================== */
  describe('creating tiles from a map', () => {
    it('creates tiles from a rectangular map', () => {
      const map = [
        ['L0', 'T1', 'L2'],
        ['I0', 'X0', 'I0'],
      ];

      const tiles = map.flatMap((row, y) =>
        row.map((token, x) => createTile(token, x, y))
      );

      expect(tiles.length).toBe(6);

      expect(tiles[0]).toMatchObject({ type: 'L', rotation: 0, x: 0, y: 0 });
      expect(tiles[1]).toMatchObject({ type: 'T', rotation: 90, x: 1, y: 0 });
      expect(tiles[2]).toMatchObject({ type: 'L', rotation: 180, x: 2, y: 0 });

      expect(tiles[3]).toMatchObject({ type: 'I', rotation: 0, x: 0, y: 1 });
      expect(tiles[4]).toMatchObject({ type: 'X', rotation: 0, x: 1, y: 1 });
      expect(tiles[5]).toMatchObject({ type: 'I', rotation: 0, x: 2, y: 1 });
    });

    it('returns empty array for empty map', () => {
      const map: string[][] = [];

      const tiles = map.flatMap((row, y) =>
        row.map((token, x) => createTile(token, x, y))
      );

      expect(tiles).toEqual([]);
    });

    it('handles rows of different lengths', () => {
      const map = [
        ['L0', 'T1'],
        ['I0', 'X0', 'I0'],
      ];

      const tiles = map.flatMap((row, y) =>
        row.map((token, x) => createTile(token, x, y))
      );

      expect(tiles.length).toBe(5);
      expect(tiles[0]).toMatchObject({ type: 'L', x: 0, y: 0 });
      expect(tiles[4]).toMatchObject({ type: 'I', x: 2, y: 1 });
    });
  });
});
