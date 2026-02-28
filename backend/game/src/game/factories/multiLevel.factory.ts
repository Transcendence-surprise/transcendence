import { Level } from "../models/level";
import { MultiplayerSettings } from "../models/state";
import { LevelObjective } from "../models/objective";
import { Board } from "../models/board";
import { createMultiplayerBoard } from "./board.factory";
import { generateMultiplayerCollectibles } from "./collectibles.factory";
import { Collectible } from "../models/collectible";

export function createMultiplayerLevel(
  settings: MultiplayerSettings
): Level {
  const board: Board = createMultiplayerBoard(settings.boardSize);

  const startingPoints = [
    { slotId: "P1", x: 0, y: 0 },
    { slotId: "P2", x: board.width - 1, y: board.height - 1 },
    ...(settings.maxPlayers >= 3
      ? [{ slotId: "P3", x: board.width - 1, y: 0 }]
      : []),
    ...(settings.maxPlayers === 4
      ? [{ slotId: "P4", x: 0, y: board.height - 1 }]
      : []),
  ];

  const objectives: LevelObjective[] = [
    { type: "COLLECT_ALL" },
    { type: "RETURN_HOME" },
  ];

  const playerIds = startingPoints.map(p => p.slotId);

  const collectiblesBase = generateMultiplayerCollectibles(
    playerIds,
    settings.collectiblesPerPlayer,
    board.width
  );

  const collectibles = placeCollectiblesRandomly(
    collectiblesBase,
    board,
    startingPoints
  );

  injectCollectiblesToBoard(board, collectibles);

  return {
    id: `multi-${settings.boardSize}x${settings.boardSize}`,
    name: "Multiplayer Level",
    board,
    startingPoints,
    objectives,
    collectibles,
  };
}

function getAvailableCollectiblePositions(
  board: Board,
  startingPoints: { x: number; y: number }[]
): { x: number; y: number }[] {
  const forbidden = new Set(startingPoints.map(p => `${p.x},${p.y}`));

  const positions: { x: number; y: number }[] = [];

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const key = `${x},${y}`;

      // Skip starting points
      if (forbidden.has(key)) continue;

      // Skip if tile doesn't exist (just in case)
      const tile = board.tiles[y]?.[x];
      if (!tile) continue;

      positions.push({ x, y });
    }
  }

  return positions;
}

function placeCollectiblesRandomly(
  collectibles: Collectible[],
  board: Board,
  startingPoints: { x: number; y: number }[]
): Collectible[] {
  const positions = getAvailableCollectiblePositions(board, startingPoints);

  if (collectibles.length > positions.length) {
    throw new Error("Not enough free tiles to place collectibles");
  }

  const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

  return collectibles.map((c, i) => ({
    ...c,
    x: shuffledPositions[i].x,
    y: shuffledPositions[i].y,
  }));
}

function injectCollectiblesToBoard(board: Board, collectibles: Collectible[]) {
  for (const c of collectibles) {
    const tile = board.tiles[c.y]?.[c.x];
    if (tile) tile.collectableId = c.id;
  }
}