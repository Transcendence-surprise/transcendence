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
    { playerId: "P1", x: 0, y: 0 },
    { playerId: "P2", x: board.width - 1, y: board.height - 1 },
    ...(settings.maxPlayers >= 3
      ? [{ playerId: "P3", x: board.width - 1, y: 0 }]
      : []),
    ...(settings.maxPlayers === 4
      ? [{ playerId: "P4", x: 0, y: board.height - 1 }]
      : []),
  ];

  const objectives: LevelObjective[] = [
    { type: "COLLECT_ALL" },
    { type: "RETURN_HOME" },
  ];

  const playerIds = startingPoints.map(p => p.playerId);

  const collectiblesBase = generateMultiplayerCollectibles(
    playerIds,
    settings.collectiblesPerPlayer
  );

  const collectibles = placeCollectiblesRandomly(
    collectiblesBase,
    board,
    startingPoints
  );

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
  const forbidden = new Set(
    startingPoints.map(p => `${p.x},${p.y}`)
  );

  const positions: { x: number; y: number }[] = [];

  for (let y = 1; y < board.height - 1; y++) {
    for (let x = 1; x < board.width - 1; x++) {
      const key = `${x},${y}`;
      if (!forbidden.has(key)) {
        positions.push({ x, y });
      }
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