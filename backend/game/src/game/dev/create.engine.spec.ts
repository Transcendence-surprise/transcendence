import { createGame } from '../engine/create.engine';
import { GameSettings } from '../models/state';

describe("createGameEngine", () => {
  it("creates a multiplayer game with host", () => {
    const settings: GameSettings = {
      mode: "MULTI",
      maxPlayers: 4,
      allowSpectators: true,
      boardSize: 7,
      collectiblesPerPlayer: 2,
    };
    const hostId = 123;
    const nickname = "HOST1";

    const state = createGame(hostId, nickname, settings);

    expect(state.hostId).toBe(hostId);
    expect(state.players[0].id).toBe(hostId);
    expect(state.phase).toBe("LOBBY");
  });

  it("creates a single-player game in PLAY phase", () => {
    const settings: GameSettings = {
      mode: "SINGLE",
      levelId: "puzzle-01"
    };
    const hostId = 123;
    const nickname = "HOST1";

    const state = createGame(hostId, nickname, settings);

    expect(state.phase).toBe("PLAY");
    expect(state.rules.mode).toBe("SINGLE");
  });
});
