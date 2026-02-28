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
    const hostId = 123;
    const nickname = "HOST1";

  it('should create a single-player game in PLAY phase', () => {
    const settings: GameSettings = {
      mode: 'SINGLE',
      allowSpectators: false,
    };

    const state = createGame(hostId, nickname, settings);

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

    const state = createGame(hostId, nickname, settings);

    expect(state.phase).toBe('PLAY');
    expect(state.currentPlayerId).toBe(hostId);
  });

  it('should create a multiplayer game in LOBBY phase', () => {
    const settings = multiSettings({
      maxPlayers: 4,
      boardSize: 7,
      collectiblesPerPlayer: 3,
    });

    const state = createGame(123, "HOST1", settings);

    expect(state.phase).toBe('LOBBY');      // multiplayer still starts in lobby
    expect(state.rules.mode).toBe('MULTI');
    expect(state.hostId).toBe(123);
    expect(state.hostName).toBe("HOST1");
    console.log("collectibles:", state.players);
    expect(state.players.length).toBe(1);
  });
});
