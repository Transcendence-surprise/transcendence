import { processBoardAction } from '../engine/boardAction.engine';
import { BoardAction, BoardActionError } from '../models/boardAction';
import { GameState } from '../models/state';

function createMockBoard(): import('../models/board').Board {
  return {
    width: 2,
    height: 2,
    tiles: [
      [
        { type: 'L', rotation: 0, x: 0, y: 0 },
        { type: 'I', rotation: 90, x: 1, y: 0 },
      ],
      [
        { type: 'T', rotation: 180, x: 0, y: 1 },
        { type: 'X', rotation: 270, x: 1, y: 1 },
      ],
    ],
  };
}

function createMockLevel(): import('../models/level').Level {
  return {
    id: 'mock-level',
    board: createMockBoard(),
    startingPoints: [{ slotId: 'P1', x: 0, y: 0 }],
    objectives: [], // minimal valid objectives
  };
}

function createMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    levelId: 'level1',
    level: createMockLevel(),
    phase: 'PLAY',
    hostId: 1,
    hostName: 'host',
    players: [{ id: 1, slotId: 'P1', name: 'Player1', x: 0, y: 0, hasMoved: false }],
    spectators: [],
    rules: { mode: 'MULTI', maxPlayers: 2, allowSpectators: false, requiresBoardActionPerTurn: true, fixedCorners: false },
    board: createMockBoard(),
    currentPlayerIndex: 0,
    currentPlayerId: 1,
    lastBoardAction: undefined,
    boardActionsPending: true,
    turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
    playerProgress: {},
    collected: {},
    gameEnded: false,
    ...overrides,
  };
}

describe('processBoardAction', () => {
  it('returns error if no state', () => {
    // @ts-expect-error: Testing undefined state handling
    const result = processBoardAction(undefined, {} as BoardAction);
    expect(result).toEqual({ ok: false, error: BoardActionError.GAME_NOT_FOUND });
  });

  it('returns error if board action already performed in MULTI', () => {
    const state = createMockState({ boardActionsPending: false });
    const result = processBoardAction(state, {} as BoardAction);
    expect(result).toEqual({ ok: false, error: BoardActionError.BOARD_ACTION_ALREADY_PERFORMED });
  });

  it('returns ok and action for valid action', () => {
    const state = createMockState();
    const action: BoardAction = { type: 'ROTATE_TILE', x: 0, y: 0 };
    const result = processBoardAction(state, action);
    expect(result).toEqual({ ok: true, action });
  });
});
