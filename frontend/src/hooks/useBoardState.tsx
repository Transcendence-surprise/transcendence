import { useState, useMemo } from "react";
import { Board } from "../game/models/board";
import { PlayerProgress } from "../game/models/gameState";

export function useBoardState(board: Board, progress: PlayerProgress) {
  const [boardState, setBoardState] = useState(board);

  const collectibleSet = useMemo(() => {
    const collectedIds = new Set<string>();
    if (progress && Array.isArray(progress.collectedItems)) {
      progress.collectedItems.forEach(id => collectedIds.add(id));
    }
    return collectedIds;
  }, [progress]);

  const shiftRow = (rowIndex: number, direction: "left" | "right") => {
    // Copy & shift row logic (your existing code)
  };

  const shiftColumn = (colIndex: number, direction: "up" | "down") => {
    // Copy & shift column logic (your existing code)
  };

  return { boardState, setBoardState, collectibleSet, shiftRow, shiftColumn };
}