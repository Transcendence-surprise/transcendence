import { leaveGameEngine } from '../engine/leave.engine';
import { createGame } from '../engine/create.engine';
import { GameSettings } from '../models/state';
import { LeaveError } from '../models/leaveResult';
import { MultiplayerSettings } from '../models/state';

const multiSettings = (overrides?: Partial<MultiplayerSettings>): GameSettings => ({
  mode: "MULTI",
  maxPlayers: 4,
  allowSpectators: true,
  boardSize: 7,
  collectiblesPerPlayer: 5,
  ...overrides,
});

describe("leaveGameEngine", () => {
  let state: ReturnType<typeof createGame>;

  beforeEach(() => {
    state = createGame("HOST1", multiSettings());

    state.players.push({ id: "P2", x: 0, y: 0, hasMoved: false });
    state.players.push({ id: "P3", x: 0, y: 0, hasMoved: false });

    state.spectators.push({ id: "S1" });
    state.spectators.push({ id: "S2" });

    state.currentPlayerId = "HOST1";
    state.currentPlayerIndex = 0;

    // default phase
    state.phase = "LOBBY";
  });

  it("allows a normal player to leave", () => {
    const result = leaveGameEngine(state, "P2");
    expect(result.ok).toBe(true);
    expect(state.players.some(p => p.id === "P2")).toBe(false);
  });

  it("allows a spectator to leave", () => {
    const result = leaveGameEngine(state, "S1");
    expect(result.ok).toBe(true);
    expect(state.spectators.some(s => s.id === "S1")).toBe(false);
  });

  it("prevents host from leaving in PLAY", () => {
    state.phase = "PLAY";

    const result = leaveGameEngine(state, "HOST1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(LeaveError.HOST_CANNOT_LEAVE);
  });

  it("allows host to leave in LOBBY and triggers deleteGame", () => {
    state.phase = "LOBBY";

    const result = leaveGameEngine(state, "HOST1");
    expect(result.ok).toBe(true);
    expect(result.deleteGame).toBe(true);
  });

  it("updates currentPlayerId if current player leaves", () => {
    state.currentPlayerId = "P2";
    state.currentPlayerIndex = 1;

    const result = leaveGameEngine(state, "P2");
    expect(result.ok).toBe(true);
    expect(state.currentPlayerId).toBe("HOST1");
    expect(state.currentPlayerIndex).toBe(0);
  });

  it("returns error for non-existent player", () => {
    const result = leaveGameEngine(state, "UNKNOWN");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(LeaveError.PLAYER_NOT_FOUND);
  });

  it("allows multiple spectators to leave", () => {
    const r1 = leaveGameEngine(state, "S1");
    const r2 = leaveGameEngine(state, "S2");
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(state.spectators.length).toBe(0);
  });

  it("handles leaving until all players gone except host", () => {
    leaveGameEngine(state, "P2");
    leaveGameEngine(state, "P3");

    expect(state.players.length).toBe(1);
    expect(state.players[0].id).toBe("HOST1");
    expect(state.currentPlayerId).toBe("HOST1");
  });
});
