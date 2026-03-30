import { checkWinCondition } from "../engine/helpers/checkwin";
import { GameState, PlayerState } from "src/game/models/state";

describe("checkWinCondition", () => {
  const player: PlayerState = { id: 1 } as PlayerState;

  it("returns true if all objectives are done", () => {
    const state: GameState = {
      playerProgress: {
        "1": {
          objectives: [
            { done: true },
            { done: true },
          ],
        },
      },
    } as any;
    expect(checkWinCondition(state, player)).toBe(true);
  });

  it("returns false if any objective is not done", () => {
    const state: GameState = {
      playerProgress: {
        "1": {
          objectives: [
            { done: true },
            { done: false },
          ],
        },
      },
    } as any;
    expect(checkWinCondition(state, player)).toBe(false);
  });

  it("returns false if player has no progress", () => {
    const state: GameState = {
      playerProgress: {},
    } as any;
    expect(checkWinCondition(state, player)).toBe(false);
  });
});
