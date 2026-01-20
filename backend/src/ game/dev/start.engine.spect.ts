import { createGame } from '../engine/create.engine';
import { startGameEngine } from '../engine/start.engine';
import { joinGameEngine } from '../engine/join.engine';
import { StartError } from '../models/startResult';
import { GameSettings, MultiplayerSettings } from '../models/state';

// Helper: generates fully valid multiplayer settings
const multiSettings = (overrides?: Partial<MultiplayerSettings>): GameSettings => ({
  mode: "MULTI",
  maxPlayers: 4,
  allowSpectators: true,
  boardSize: 7,
  collectiblesPerPlayer: 5,
  ...overrides,
});

describe("startGameEngine", () => {
  const hostId = "HOST1";

  it("auto-starts single-player game", () => {
    const state = createGame(hostId, {
      mode: "SINGLE",
      allowSpectators: false,
    });

    // single-player games start in PLAY immediately
    expect(state.phase).toBe("PLAY");
    expect(state.currentPlayerId).toBe(hostId);
    expect(state.players.length).toBe(1);
    expect(state.players[0].id).toBe(hostId);
  });

  it("starts multiplayer game if host and enough players", () => {
    const state = createGame(hostId, multiSettings());

    // Add second player to satisfy minimum
    joinGameEngine(state, "P2", "PLAYER");

    const result = startGameEngine(state, hostId);

    expect(result.ok).toBe(true);
    expect(state.phase).toBe("PLAY");
    expect(state.currentPlayerId).toBe(hostId);
  });

  it("fails if non-host tries to start multiplayer game", () => {
    const state = createGame(hostId, multiSettings());

    joinGameEngine(state, "P2", "PLAYER");

    const result = startGameEngine(state, "P2"); // non-host

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(StartError.NOT_HOST);
  });

  it("fails if not enough players", () => {
    const state = createGame(hostId, multiSettings({ maxPlayers: 4 }));

    // Only host is present, not enough
    const result = startGameEngine(state, hostId);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(StartError.NOT_ENOUGH_PLAYERS);
  });

  it("fails if game already started", () => {
    const state = createGame(hostId, multiSettings());
    joinGameEngine(state, "P2", "PLAYER");

    // Start first time
    const first = startGameEngine(state, hostId);
    expect(first.ok).toBe(true);
    expect(state.phase).toBe("PLAY");

    // Start second time
    const second = startGameEngine(state, hostId);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toBe(StartError.ALREADY_STARTED);
  });
});