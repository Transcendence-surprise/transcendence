// src/hooks/useGameActions.tsx

import { useEffect, useRef } from "react";
import { boardModification, leaveGame, playerMove } from "../api/game";

export function useGameActions(
  gameId: string,
  setSelectedButton: ((id: string) => void) | undefined,
  navigate: (n: number) => void,
  onAlert?: (message: string, title?: string) => void
) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const nextAbortSignal = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  const handleRowClick = async (rowIndex: number, direction: "left" | "right") => {
    setSelectedButton?.(`${direction}-${rowIndex}`);
    try {
      const signal = nextAbortSignal();
      await boardModification(gameId, {
        type: "SHIFT",
        axis: "ROW",
        index: rowIndex,
        direction: direction.toUpperCase() as "LEFT" | "RIGHT",
      }, signal);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Row Shift Failed");
        console.error(err);
      }
    }
  };

  const handleColClick = async (colIndex: number, direction: "up" | "down") => {
    setSelectedButton?.(`${direction === "up" ? "top" : "bottom"}-${colIndex}`);
    try {
      const signal = nextAbortSignal();
      await boardModification(gameId, {
        type: "SHIFT",
        axis: "COL",
        index: colIndex,
        direction: direction.toUpperCase() as "UP" | "DOWN",
      }, signal);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Column Shift Failed");
        console.error(err);
      }
    }
  };

  const handleRotateTile = async (x: number, y: number) => {
    try {
      const signal = nextAbortSignal();
      await boardModification(gameId, {
        type: "ROTATE_TILE",
        x,
        y,
      }, signal);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Rotate Failed");
        console.error(err);
      }
    }
  };

  const handleSwapTiles = async (x1: number, y1: number, x2: number, y2: number) => {
    try {
      const signal = nextAbortSignal();
      await boardModification(gameId, {
        type: "SWAP_TILES",
        x1,
        y1,
        x2,
        y2,
      }, signal);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Swap Failed");
        console.error(err);
      }
    }
  };

  const handlePlayerAction = async (path: { x: number; y: number }[]) => {
    try {
      const signal = nextAbortSignal();
      await playerMove(gameId, path, false, signal);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Move Failed");
        console.error(err);
      }
    }
  };
  
  const handleSkip = async () => {
    try {
      const signal = nextAbortSignal();
      await playerMove(gameId, [], true, signal);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Skip Failed");
        console.error(err);
      }
    }
  };

  const handleLeaveGame = async () => {
    try {
      const signal = nextAbortSignal();
      const result = await leaveGame(gameId, signal);
      if (!result.ok) {
        onAlert?.("Error leaving game", "Leave Game Failed");
        return;
      }

      navigate(-1);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onAlert?.(err?.message || err, "Leave Game Failed");
        console.error(err);
      }
    }
  };

  return {
    handleRowClick,
    handleColClick,
    handleRotateTile,
    handleSwapTiles,
    handlePlayerAction,
    handleSkip,
    handleLeaveGame,
  };
}                                                                                                       