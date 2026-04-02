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
    players: [{ id: 1, slotId: 'P1', name: 'Player1', x: 0, y: 0, hasMoved: false, skipsLeft: 0, totalMoves: 0 }],
    spectators: [],
    rules: { mode: 'MULTI', maxPlayers: 2, allowSpectators: false, requiresBoardActionPerTurn: true, fixedCorners: false },
    board: createMockBoard(),
    currentPlayerIndex: 0,
    currentPlayerId: 1,
    lastBoardAction: undefined,
    boardActionsPending: true,
    turnActions: { rotateCount: {}, shiftDone: false, swapDone: false },
    playerProgress: {},
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
    const action: BoardAction = { type: 'ROTATE_TILE', x: 1, y: 1 };
    const result = processBoardAction(state, action);
    expect(result).toEqual({ ok: true, action });
  });

  // --- New tests for player-on-tile restrictions ---
  it('prevents rotating a tile with a player on it', () => {
    const state = createMockState();
    // Player is at (0, 0)
    const action: BoardAction = { type: 'ROTATE_TILE', x: 0, y: 0 };
    const result = processBoardAction(state, action);
    expect(result).toEqual({ ok: false, error: BoardActionError.INVALID_ACTION });
  });

  it('allows rotating a tile without a player on it', () => {
    const state = createMockState();
    // Player is at (0, 0), rotate tile at (1, 1)
    const action: BoardAction = { type: 'ROTATE_TILE', x: 1, y: 1 };
    const result = processBoardAction(state, action);
    expect(result.ok).toBe(true);
  });

  it('prevents swapping if first tile has a player on it', () => {
    const state = createMockState();
    // Player is at (0, 0), swap (0, 0) with (1, 0)
    const action: BoardAction = { type: 'SWAP_TILES', x1: 0, y1: 0, x2: 1, y2: 0 };
    const result = processBoardAction(state, action);
    expect(result).toEqual({ ok: false, error: BoardActionError.INVALID_ACTION });
  });

  it('prevents swapping if second tile has a player on it', () => {
    const state = createMockState();
    // Player is at (0, 0), swap (1, 0) with (0, 0)
    const action: BoardAction = { type: 'SWAP_TILES', x1: 1, y1: 0, x2: 0, y2: 0 };
    const result = processBoardAction(state, action);
    expect(result).toEqual({ ok: false, error: BoardActionError.INVALID_ACTION });
  });

  it('allows swapping tiles without players on either', () => {
    const state = createMockState();
    // Player is at (0, 0), swap (1, 0) with (0, 1)
    const action: BoardAction = { type: 'SWAP_TILES', x1: 1, y1: 0, x2: 0, y2: 1 };
    const result = processBoardAction(state, action);
    expect(result.ok).toBe(true);
  });

  // --- New tests for player movement with shifts ---
  it('moves player left when shifting row left', () => {
    const state = createMockState();
    // Player at (1, 0), shift row 0 left
    state.players[0].x = 1;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'SHIFT', axis: 'ROW', index: 0, direction: 'LEFT' };
    processBoardAction(state, action);
    // Player should move from (1, 0) to (0, 0)
    expect(state.players[0].x).toBe(0);
    expect(state.players[0].y).toBe(0);
  });

  it('moves player right when shifting row right', () => {
    const state = createMockState();
    // Player at (0, 0), shift row 0 right
    state.players[0].x = 0;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'SHIFT', axis: 'ROW', index: 0, direction: 'RIGHT' };
    processBoardAction(state, action);
    // Player should move from (0, 0) to (1, 0)
    expect(state.players[0].x).toBe(1);
    expect(state.players[0].y).toBe(0);
  });

  it('wraps player around when shifting row left from x=0', () => {
    const state = createMockState();
    // Board is 2x2, player at (0, 0), shift row 0 left
    state.players[0].x = 0;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'SHIFT', axis: 'ROW', index: 0, direction: 'LEFT' };
    processBoardAction(state, action);
    // Player should wrap around to (1, 0) = (0 - 1 + 2) % 2
    expect(state.players[0].x).toBe(1);
    expect(state.players[0].y).toBe(0);
  });

  it('wraps player around when shifting row right from x=1', () => {
    const state = createMockState();
    // Board is 2x2, player at (1, 0), shift row 0 right
    state.players[0].x = 1;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'SHIFT', axis: 'ROW', index: 0, direction: 'RIGHT' };
    processBoardAction(state, action);
    // Player should wrap around to (0, 0) = (1 + 1) % 2
    expect(state.players[0].x).toBe(0);
    expect(state.players[0].y).toBe(0);
  });

  it('moves player up when shifting column up', () => {
    const state = createMockState();
    // Player at (0, 1), shift column 0 up
    state.players[0].x = 0;
    state.players[0].y = 1;
    const action: BoardAction = { type: 'SHIFT', axis: 'COL', index: 0, direction: 'UP' };
    processBoardAction(state, action);
    // Player should move from (0, 1) to (0, 0)
    expect(state.players[0].x).toBe(0);
    expect(state.players[0].y).toBe(0);
  });

  it('moves player down when shifting column down', () => {
    const state = createMockState();
    // Player at (0, 0), shift column 0 down
    state.players[0].x = 0;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'SHIFT', axis: 'COL', index: 0, direction: 'DOWN' };
    processBoardAction(state, action);
    // Player should move from (0, 0) to (0, 1)
    expect(state.players[0].x).toBe(0);
    expect(state.players[0].y).toBe(1);
  });

  it('does not move player if on different row/column', () => {
    const state = createMockState();
    // Player at (0, 0), shift row 1 left
    state.players[0].x = 0;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'SHIFT', axis: 'ROW', index: 1, direction: 'LEFT' };
    processBoardAction(state, action);
    // Player should stay at (0, 0)
    expect(state.players[0].x).toBe(0);
    expect(state.players[0].y).toBe(0);
  });

  it('does not move player if rotating a tile', () => {
    const state = createMockState();
    // Player at (0, 0), rotate tile at (1, 1)
    state.players[0].x = 0;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'ROTATE_TILE', x: 1, y: 1 };
    processBoardAction(state, action);
    // Player should stay at (0, 0)
    expect(state.players[0].x).toBe(0);
    expect(state.players[0].y).toBe(0);
  });

  it('ends single-player game as loss when maxMoves is exceeded by board action', () => {
    const state = createMockState({
      rules: { mode: 'SINGLE', maxPlayers: 1, allowSpectators: false, requiresBoardActionPerTurn: false, fixedCorners: false },
      level: { ...createMockLevel(), constraints: { maxMoves: 1 } } as any,
      boardActionsPending: false,
    });
    state.players[0].totalMoves = 1;

    state.players[0].x = 0;
    state.players[0].y = 0;
    const action: BoardAction = { type: 'ROTATE_TILE', x: 1, y: 1 };

    const result = processBoardAction(state, action);
    expect(result.ok).toBe(true);
    expect(state.phase).toBe('END');
    expect(state.gameEnded).toBe(true);
    expect(state.gameResult).toBeUndefined();
    expect(state.endReason).toBe('LOSE_MAX_MOVES');
  });
});
