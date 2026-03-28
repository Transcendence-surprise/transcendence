// src/hooks/useGameActions.tsx

import { boardModification, leaveGame } from "../api/game";

export function useGameActions(
  gameId: string,
  setSelectedButton: (id: string) => void,
  navigate: (n: number) => void
) {

  const handleRowClick = async (rowIndex: number, direction: "left" | "right") => {
    setSelectedButton(`${direction}-${rowIndex}`);
    try {
      await boardModification(gameId, {
        type: "SHIFT",
        axis: "ROW",
        index: rowIndex,
        direction: direction.toUpperCase() as "LEFT" | "RIGHT",
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        alert(err?.message || err);
        console.error(err);
      }
    }
  };

  const handleColClick = async (colIndex: number, direction: "up" | "down") => {
    setSelectedButton(`${direction === "up" ? "top" : "bottom"}-${colIndex}`);
    try {
      await boardModification(gameId, {
        type: "SHIFT",
        axis: "COL",
        index: colIndex,
        direction: direction.toUpperCase() as "UP" | "DOWN",
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        alert(err?.message || err);
        console.error(err);
      }
    }
  };

  const handleLeaveGame = async () => {
    try {
      const result = await leaveGame(gameId);
      if (!result.ok) alert("Error leaving game");
    } catch {
      alert("Error leaving game");
    } finally {
      navigate(-1);
    }
  };

  const handleRotateTile = async (x: number, y: number) => {
    try {
      await boardModification(gameId, {
        type: "ROTATE_TILE",
        x,
        y,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        alert(err?.message || err);
        console.error(err);
      }
    }
  };

  const handleSwapTiles = async (x1: number, y1: number, x2: number, y2: number) => {
    try {
      await boardModification(gameId, {
        type: "SWAP_TILES",
        x1,
        y1,
        x2,
        y2,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        alert(err?.message || err);
        console.error(err);
      }
    }
  };

  const handleSkip = () => console.log("Skip clicked (placeholder)");

  return {
    handleRowClick,
    handleColClick,
    handleRotateTile,
    handleSwapTiles,
    handleLeaveGame,
    handleSkip,
  };
}                                                                                                       