import { listSinglePlayerLevels } from '../engine/levelRegistry.engine';

describe('listSinglePlayerLevels', () => {
  it('returns at least one level', () => {
    const levels = listSinglePlayerLevels();
    expect(levels.length).toBeGreaterThan(0);
  });

  it('each level has id and name', () => {
    const levels = listSinglePlayerLevels();

    for (const level of levels) {
      expect(typeof level.id).toBe('string');
      expect(level.id.length).toBeGreaterThan(0);

      expect(typeof level.name).toBe('string');
      expect(level.name.length).toBeGreaterThan(0);
    }
  });

  it('description is optional but if present must be string', () => {
    const levels = listSinglePlayerLevels();

    for (const level of levels) {
      if (level.description !== undefined) {
        expect(typeof level.description).toBe('string');
      }
    }
  });
});
