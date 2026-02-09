import { joinGameEngine } from '../engine/join.engine';
import { createGame } from '../engine/create.engine';
import { GameSettings } from '../models/state';
import { JoinError } from '../models/joinResult';
import { MultiplayerSettings } from '../models/state';

const multiSettings = (overrides?: Partial<MultiplayerSettings>): GameSettings => ({
  mode: "MULTI",
  maxPlayers: 4,
  allowSpectators: true,
  boardSize: 7,
  collectiblesPerPlayer: 5, // default
  ...overrides,
});

describe("joinGameEngine", () => {
  it("allows a player to join during LOBBY", () => {
    const state = createGame("HOST1", multiSettings());

    const result = joinGameEngine(state, "P2", "PLAYER");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.role).toBe("PLAYER");
    expect(state.players.some(p => p.id === "P2")).toBe(true);
  });

  it("rejects player joining twice", () => {
    const state = createGame("HOST1", multiSettings());

    joinGameEngine(state, "P2", "PLAYER");
    const result = joinGameEngine(state, "P2", "PLAYER");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(JoinError.PLAYER_ALREADY_JOINED);
  });

  it("rejects player join after game started", () => {
    const state = createGame("HOST1", multiSettings());

    joinGameEngine(state, "P2", "PLAYER");
    state.phase = "PLAY";

    const result = joinGameEngine(state, "P3", "PLAYER");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(JoinError.GAME_ALREADY_STARTED);
  });

  it("rejects player join if game full", () => {
    const state = createGame(
      "HOST1",
      multiSettings({ maxPlayers: 2 })
    );

    joinGameEngine(state, "P2", "PLAYER");

    const result = joinGameEngine(state, "P3", "PLAYER");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(JoinError.GAME_FULL);
  });

  it("allows spectator to join during LOBBY", () => {
    const state = createGame(
      "HOST1",
      multiSettings({ maxPlayers: 2 })
    );

    const result = joinGameEngine(state, "S1", "SPECTATOR");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.role).toBe("SPECTATOR");
    expect(state.spectators.some(s => s.id === "S1")).toBe(true);
  });

  it("allows spectator to join after game started if allowed", () => {
    const state = createGame(
      "HOST1",
      multiSettings({ maxPlayers: 2 })
    );

    state.phase = "PLAY";

    const result = joinGameEngine(state, "S1", "SPECTATOR");

    expect(result.ok).toBe(true);
  });

  it("rejects spectator if spectators not allowed", () => {
    const state = createGame(
      "HOST1",
      multiSettings({ maxPlayers: 2, allowSpectators: false })
    );

    state.phase = "PLAY";

    const result = joinGameEngine(state, "S1", "SPECTATOR");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(JoinError.SPECTATORS_NOT_ALLOWED);
    }
  });

  it("multiple spectators can join if allowed", () => {
    const state = createGame(
      "HOST1",
      multiSettings({ maxPlayers: 2 })
    );

    const r1 = joinGameEngine(state, "S1", "SPECTATOR");
    const r2 = joinGameEngine(state, "S2", "SPECTATOR");

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(state.spectators.length).toBe(2);
  });
});