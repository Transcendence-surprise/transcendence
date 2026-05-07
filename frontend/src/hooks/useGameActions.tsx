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

  const extractGameErrorCode = (error: unknown): string | null => {
    const message = error instanceof Error ? error.message : null;
    if (!message) return null;

    const upper = message.toUpperCase();
    const knownCodes = [
      "GAME_NOT_FOUND",
      "PLAYER_NOT_FOUND",
      "NOT_IN_GAME",
      "NOT_YOUR_TURN",
      "INVALID_ACTION",
      "REQUIRED_BOARD_ACTION",
      "BOARD_ACTION_ALREADY_PERFORMED",
    ];

    return knownCodes.find((code) => upper.includes(code)) ?? null;
  };

  const getGameErrorMessage = (code: string | null, fallback: string): string => {
    switch (code) {
      case "GAME_NOT_FOUND":
        return "Game not found.";
      case "PLAYER_NOT_FOUND":
        return "Player not found.";
      case "NOT_IN_GAME":
        return "You are not in this game.";
      case "NOT_YOUR_TURN":
        return "It is not your turn.";
      case "REQUIRED_BOARD_ACTION":
        return "You must perform a board action first.";
      case "BOARD_ACTION_ALREADY_PERFORMED":
        return "You already performed a board action this turn.";
      case "INVALID_ACTION":
        return "That action is not allowed.";
      default:
        return fallback;
    }
  };

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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to shift row. Please try a different move.",
          ),
          "Row Shift Failed",
        );
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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to shift column. Please try a different move.",
          ),
          "Column Shift Failed",
        );
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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to rotate tile. Please try a different move.",
          ),
          "Rotate Failed",
        );
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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to swap tiles. Please try a different move.",
          ),
          "Swap Failed",
        );
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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to move. Please try again.",
          ),
          "Move Failed",
        );
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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to skip your turn. Please try again.",
          ),
          "Skip Failed",
        );
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
        onAlert?.(
          getGameErrorMessage(
            extractGameErrorCode(err),
            "Unable to leave the game. Please try again.",
          ),
          "Leave Game Failed",
        );
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