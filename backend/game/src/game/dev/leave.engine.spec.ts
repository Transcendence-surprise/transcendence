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
    state = createGame(1, "HOST1", multiSettings());

    state.players.push({ id: 2, slotId: "P2", name: "2", x: 0, y: 0, hasMoved: false });
    state.players.push({ id: 3, slotId: "P3", name: "3", x: 0, y: 0, hasMoved: false });

    state.spectators.push({ id: 11 });
    state.spectators.push({ id: 22 });

    state.currentPlayerIndex = 0;

    state.phase = "LOBBY";
  });

  it("allows a normal player to leave", () => {
    const result = leaveGameEngine(state, 2);
    expect(result.ok).toBe(true);
    expect(state.players.some(p => p.id === 2)).toBe(false);
  });

  it("allows a spectator to leave", () => {
    const result = leaveGameEngine(state, 11);
    expect(result.ok).toBe(true);
    expect(state.spectators.some(s => s.id === 11)).toBe(false);
  });

  it("prevents host from leaving in PLAY", () => {
    state.phase = "PLAY";
    const result = leaveGameEngine(state, 1);
    expect(result.ok).toBe(true);
    expect(result.deleteGame).toBeUndefined();
    // Host should be removed from players
    expect(state.players.some(p => p.id === 1)).toBe(false);
    // Game is not deleted unless only one player remains
  });

  it("allows host to leave in LOBBY and triggers deleteGame", () => {
    state.phase = "LOBBY";
    const result = leaveGameEngine(state, 1);
    expect(result.ok).toBe(true);
    expect(result.deleteGame).toBe(true);
  });

  it("updates currentPlayerId if current player leaves", () => {
    state.currentPlayerIndex = 1;

    const result = leaveGameEngine(state, 2);
    expect(result.ok).toBe(true);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.players[state.currentPlayerIndex].id).toBe(3);
  });

  it("returns error for non-existent player", () => {
    const result = leaveGameEngine(state, 99);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(LeaveError.PLAYER_NOT_FOUND);
  });

  it("allows multiple spectators to leave", () => {
    const r1 = leaveGameEngine(state, 11);
    const r2 = leaveGameEngine(state, 22);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(state.spectators.length).toBe(0);
  });

  it("handles leaving until all players gone except host", () => {
    let r = leaveGameEngine(state, 2);
    expect(r.ok).toBe(true);
    // After player 2 leaves, game should not be deleted
    expect(r.deleteGame).toBeUndefined();
    r = leaveGameEngine(state, 3);
    expect(r.ok).toBe(true);
    // After player 3 leaves, only host remains, so game should be deleted
    expect(r.deleteGame).toBe(true);
    expect(state.players.length).toBe(1);
    expect(state.players[0].id).toBe(1);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[state.currentPlayerIndex].id).toBe(1);
  });

  it("handles leaving until all players gone except host (multi mode)", () => {
    // Remove player 2 (3 players remain)
    let r = leaveGameEngine(state, 2);
    expect(r.ok).toBe(true);
    expect(r.deleteGame).toBeUndefined();
    // Remove player 3 (now only host remains, so game should be deleted)
    r = leaveGameEngine(state, 3);
    expect(r.ok).toBe(true);
    expect(r.deleteGame).toBe(true);
    expect(state.players.length).toBe(1);
    expect(state.players[0].id).toBe(1);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[state.currentPlayerIndex].id).toBe(1);
  });

  it("deletes game when last player leaves in single mode", () => {
    // Set up single mode with one player (host)
    const singleSettings = { mode: "SINGLE" } as const;
    state = createGame(1, "HOST1", singleSettings);
    expect(state.players.length).toBe(1);
    const r = leaveGameEngine(state, 1);
    expect(r.ok).toBe(true);
    expect(r.deleteGame).toBe(true);
    expect(state.players.length).toBe(1); // player array not mutated until deletion
  });

  it("removes current player and sets host as current if needed", () => {
    state.currentPlayerIndex = 2;
    const result = leaveGameEngine(state, 3);
    expect(result.ok).toBe(true);
    expect(state.players.find(p => p.id === 3)).toBeUndefined();
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[state.currentPlayerIndex].id).toBe(1); // host now first
  });

  it("leaving all spectators leaves empty spectator list", () => {
    leaveGameEngine(state, 11);
    leaveGameEngine(state, 22);
    expect(state.spectators.length).toBe(0);
  });

  it("host cannot leave in PLAY but can in LOBBY", () => {
    state.phase = "PLAY";
    let r = leaveGameEngine(state, 1);
    expect(r.ok).toBe(true);
    expect(r.deleteGame).toBeUndefined();
    expect(state.players.some(p => p.id === 1)).toBe(false);
    state.phase = "LOBBY";
    r = leaveGameEngine(state, 1);
    expect(r.ok).toBe(true);
    expect(r.deleteGame).toBe(true);
  });
});