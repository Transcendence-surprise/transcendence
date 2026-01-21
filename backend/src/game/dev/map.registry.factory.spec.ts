import { singlePlayerLevels } from '../factories/mapRegistry';

describe('singlePlayerLevels registry', () => {
  it('contains at least one level', () => {
    expect(Object.keys(singlePlayerLevels).length).toBeGreaterThan(0);
  });

  it('each level has meta with name', () => {
    for (const [, entry] of Object.entries(singlePlayerLevels)) {
      expect(entry.meta).toBeDefined();
      expect(typeof entry.meta.name).toBe('string');
      expect(entry.meta.name.length).toBeGreaterThan(0);
    }
  });

  it('each level has a rectangular map', () => {
    for (const [, entry] of Object.entries(singlePlayerLevels)) {
      const map = entry.map;

      expect(map.length).toBeGreaterThan(0);
      const width = map[0].length;

      for (const row of map) {
        expect(row.length).toBe(width);
      }
    }
  });
});
