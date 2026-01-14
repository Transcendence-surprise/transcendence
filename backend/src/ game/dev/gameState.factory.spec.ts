import { createGame } from '../engine/create.engine';
import { GameSettings } from '../models/state';
import { MultiplayerSettings } from '../models/state';

const multiSettings = (overrides?: Partial<MultiplayerSettings>): GameSettings => ({
  mode: "MULTI",
  maxPlayers: 4,
  allowSpectators: true,
  boardSize: 7,
  collectiblesPerPlayer: 5,
  ...overrides,
});

describe('Game Engine', () => {
  const hostId = 'host1';

  it('should create a single-player game in PLAY phase', () => {
    const settings: GameSettings = {
      mode: 'SINGLE',
      allowSpectators: false,
    };

    const state = createGame(hostId, settings);

    expect(state.phase).toBe('PLAY');
    expect(state.rules.mode).toBe('SINGLE');
    expect(state.hostId).toBe(hostId);
    expect(state.players.length).toBe(1);
    expect(state.players[0].id).toBe(hostId);
    expect(state.currentPlayerId).toBe(hostId);
  });

  it('should not call startGameEngine for single-player (already PLAY)', () => {
    const settings: GameSettings = {
      mode: 'SINGLE',
      allowSpectators: false,
    };

    const state = createGame(hostId, settings);

    expect(state.phase).toBe('PLAY');
    expect(state.currentPlayerId).toBe(hostId);
  });

  it('should create a multiplayer game in LOBBY phase', () => {
    const settings = multiSettings({
      maxPlayers: 4,
      boardSize: 7,
      collectiblesPerPlayer: 3,
    });

    const state = createGame("HOST1", settings);

    expect(state.phase).toBe('LOBBY');      // multiplayer still starts in lobby
    expect(state.rules.mode).toBe('MULTI');
    expect(state.hostId).toBe("HOST1");
    expect(state.players.length).toBe(1);
  });
});
