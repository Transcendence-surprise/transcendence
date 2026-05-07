// src/components/game/BoardCanvas.tsx
import { useRef, useState } from "react";
import { Board } from "../../game/models/board";
import { PlayerState } from "../../game/models/privatState";
import { useDrawBoard } from "../../hooks/useDrawBoard";
import { ArrowButton } from "./utils/ArrowButton";
import Alert from "../shared/Alert";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { CELL_SIZE } from "../../game/models/constants";
import SimpleButton from "../shared/SimpleButton";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function getTileOpenings(tile: Board["tiles"][number][number]): Direction[] {
  switch (tile.type) {
    case "W":
      return [];
    case "L":
      switch (tile.rotation) {
        case 0:
          return ["UP", "RIGHT"];
        case 90:
          return ["RIGHT", "DOWN"];
        case 180:
          return ["DOWN", "LEFT"];
        case 270:
          return ["LEFT", "UP"];
      }
      break;
    case "I":
      return tile.rotation % 180 === 0 ? ["UP", "DOWN"] : ["LEFT", "RIGHT"];
    case "T":
      switch (tile.rotation) {
        case 0:
          return ["UP", "DOWN", "RIGHT"];
        case 90:
          return ["LEFT", "RIGHT", "DOWN"];
        case 180:
          return ["UP", "DOWN", "LEFT"];
        case 270:
          return ["LEFT", "RIGHT", "UP"];
      }
      break;
    case "X":
      return ["UP", "DOWN", "LEFT", "RIGHT"];
  }
  return [];
}

function canMoveOnBoard(
  board: Board,
  from: { x: number; y: number },
  to: { x: number; y: number },
): boolean {
  const fromTile = board.tiles[from.y]?.[from.x];
  const toTile = board.tiles[to.y]?.[to.x];
  if (!fromTile || !toTile) return false;

  const fromOpenings = getTileOpenings(fromTile);
  const toOpenings = getTileOpenings(toTile);
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 1 && dy === 0)
    return fromOpenings.includes("RIGHT") && toOpenings.includes("LEFT");
  if (dx === -1 && dy === 0)
    return fromOpenings.includes("LEFT") && toOpenings.includes("RIGHT");
  if (dx === 0 && dy === 1)
    return fromOpenings.includes("DOWN") && toOpenings.includes("UP");
  if (dx === 0 && dy === -1)
    return fromOpenings.includes("UP") && toOpenings.includes("DOWN");
  return false;
}

export type BoardCanvasProps = {
  board: Board;
  players: PlayerState[];
  currentPlayerId: string | number;
  exitPoints?: { x: number; y: number }[];
  selectedTiles: { x: number; y: number }[];
  setSelectedTiles: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }[]>
  >;
  onArrowClick: (
    axis: "ROW" | "COL",
    index: number,
    direction: "UP" | "DOWN" | "LEFT" | "RIGHT",
  ) => void;
  onPlayerMove: (path: { x: number; y: number }[]) => Promise<void>;
  onRotateClick: () => void;
  onSwapClick: () => void;
  onSkipClick: () => void;
  canRotate: boolean;
  canSwap: boolean;
  boardActionsPending?: boolean;
  isSpectator?: boolean;
};

export function BoardCanvas({
  board,
  players,
  currentPlayerId,
  exitPoints,
  selectedTiles,
  setSelectedTiles,
  onArrowClick,
  onPlayerMove,
  onRotateClick,
  onSwapClick,
  onSkipClick,
  canRotate,
  canSwap,
  boardActionsPending = false,
  isSpectator = false,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw board and players, highlight selected tiles
  useDrawBoard(canvasRef, board, players, selectedTiles, exitPoints);

  const [selectedPlayer, setSelectedPlayer] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [movePath, setMovePath] = useState<{ x: number; y: number }[]>([]);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("Notice");
  const getPlayerAt = (x: number, y: number) =>
    players.find((p) => p.x === x && p.y === y);
  const currentPlayer = players.find(
    (player) => player.id.toString() === currentPlayerId.toString(),
  );
  const boardHint =
    selectedTiles.length === 1
      ? "One tile selected: press Rotate, or select one more adjacent tile to swap."
      : selectedTiles.length === 2
        ? "Two tiles selected: press Swap, or click one to adjust the selection."
        : "No selection: use arrows to shift rows/cols, click a tile to rotate/swap, or click a player to move.";

  const resetMoveSelection = () => {
    setSelectedPlayer(null);
    setMovePath([]);
    setSelectedTiles([]);
  };

  const showAlert = (message: string, title: string = "Notice") => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertOpen(true);
  };

  const submitMovePath = async () => {
    if (movePath.length === 0 || isSubmittingMove) return;
    setIsSubmittingMove(true);
    try {
      await onPlayerMove(movePath);
      resetMoveSelection();
    } catch (e: any) {
      showAlert(e.message || "Move failed", "Move Failed");
    } finally {
      setIsSubmittingMove(false);
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpectator) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    const tile = board.tiles[y]?.[x];
    if (!tile) return;

    const isPlayerTile = !!getPlayerAt(x, y);

    // --- MOVE MODE ---
    if (selectedPlayer) {
      if (selectedPlayer.x === x && selectedPlayer.y === y) {
        if (movePath.length > 0) {
          await submitMovePath();
          return;
        }

        resetMoveSelection();
        return;
      }

      const current =
        movePath.length > 0 ? movePath[movePath.length - 1] : selectedPlayer;
      const dx = Math.abs(current.x - x);
      const dy = Math.abs(current.y - y);
      const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

      if (!isAdjacent) {
        showAlert("Each step must be adjacent to the previous one");
        return;
      }

      if (!canMoveOnBoard(board, current, { x, y })) {
        showAlert("Path is blocked by walls between these tiles");
        return;
      }

      setMovePath((prev) => {
        const existingIndex = prev.findIndex(
          (step) => step.x === x && step.y === y,
        );
        if (existingIndex >= 0) {
          return prev.slice(0, existingIndex + 1);
        }
        return [...prev, { x, y }];
      });

      return;
    }

    // --- SELECT PLAYER ---
    if (isPlayerTile) {
      const isCurrentPlayerClicked =
        currentPlayer?.x === x && currentPlayer?.y === y;

      if (isCurrentPlayerClicked) {
        setSelectedPlayer({ x, y });
        setMovePath([]);
        setSelectedTiles([]);
        return;
      }

      // ignore all other players completely
      return;
    }

    // --- BOARD MODE (NO PLAYER ALLOWED) ---
    if (tile.fixed || isPlayerTile) return;

    setSelectedTiles((prev) => {
      const exists = prev.some((t) => t.x === x && t.y === y);
      if (exists) return prev.filter((t) => t.x !== x || t.y !== y);
      if (prev.length >= 2) return prev;
      return [...prev, { x, y }];
    });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Alert
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      {!isSpectator && (
        <div className="mb-3 w-[600px] max-w-full">
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
            <div className="flex min-h-[44px] items-center justify-center text-center text-sm leading-6 text-white/75 sm:text-base">
              {boardHint}
            </div>
          </div>
          {boardActionsPending && (
            <div className="mt-2 flex justify-center">
              <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
                Board action required
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top arrows */}
      {!isSpectator && (
        <div
          className="flex justify-center -mb-2"
          style={{ width: board.width * CELL_SIZE }}
        >
          {Array.from({ length: board.width }).map((_, colIndex) => (
            <div
              key={`top-slot-${colIndex}`}
              style={{
                width: CELL_SIZE,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ArrowButton
                axis="COL"
                index={colIndex}
                direction="DOWN"
                onClick={onArrowClick}
              >
                <MdOutlineKeyboardArrowDown />
              </ArrowButton>
            </div>
          ))}
        </div>
      )}
      {/* Left + Canvas + Right */}
      <div className="flex items-stretch gap-0">
        {!isSpectator && (
          <div
            className="flex flex-col"
            style={{ height: board.height * CELL_SIZE, width: CELL_SIZE }}
          >
            {Array.from({ length: board.height }).map((_, rowIndex) => (
              <div
                key={`left-slot-${rowIndex}`}
                style={{
                  height: CELL_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 4,
                }}
              >
                <ArrowButton
                  axis="ROW"
                  index={rowIndex}
                  direction="RIGHT"
                  onClick={onArrowClick}
                >
                  <MdOutlineKeyboardArrowRight />
                </ArrowButton>
              </div>
            ))}
          </div>
        )}
        <div
          className="relative border-gray-400 rounded-lg overflow-hidden flex-shrink-0"
          style={{
            width: board.width * CELL_SIZE,
            height: board.height * CELL_SIZE,
          }}
        >
          {!isSpectator && (
            <>
              {/* Highlight selected tiles */}
              {selectedTiles.map(({ x, y }: { x: number; y: number }) => (
                <div
                  key={`selected-${x}-${y}`}
                  style={{
                    position: "absolute",
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: "rgba(59, 130, 246, 0.4)", // Tailwind blue-500/40
                    border: "2px solid #2563eb", // Tailwind blue-600
                    borderRadius: 6,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
              ))}

              {/* Highlight selected player (yellow) */}
              {selectedPlayer && (
                <div
                  key={`player-selected-${selectedPlayer.x}-${selectedPlayer.y}`}
                  style={{
                    position: "absolute",
                    left: selectedPlayer.x * CELL_SIZE,
                    top: selectedPlayer.y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    border: "3px solid #facc15", // Tailwind yellow-400
                    borderRadius: 6,
                    boxShadow: "0 0 0 2px #fde68a", // subtle yellow glow
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                />
              )}

              {/* Highlight move path (green) */}
              {movePath.map((step, index) => (
                <div
                  key={`move-step-${step.x}-${step.y}-${index}`}
                  style={{
                    position: "absolute",
                    left: step.x * CELL_SIZE,
                    top: step.y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: "rgba(34,197,94,0.4)",
                    border: "2px solid #22c55e",
                    borderRadius: 6,
                    pointerEvents: "none",
                    zIndex: 4,
                  }}
                />
              ))}
            </>
          )}

          <canvas
            ref={canvasRef}
            className="block"
            onClick={handleCanvasClick}
            style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }}
          />
        </div>
        {!isSpectator && (
          <div
            className="flex flex-col"
            style={{ height: board.height * CELL_SIZE, width: CELL_SIZE }}
          >
            {Array.from({ length: board.height }).map((_, rowIndex) => (
              <div
                key={`right-slot-${rowIndex}`}
                style={{
                  height: CELL_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingLeft: 4,
                }}
              >
                <ArrowButton
                  axis="ROW"
                  index={rowIndex}
                  direction="LEFT"
                  onClick={onArrowClick}
                >
                  <MdOutlineKeyboardArrowLeft />
                </ArrowButton>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Bottom arrows */}
      {!isSpectator && (
        <div
          className="flex justify-center -mt-2"
          style={{ width: board.width * CELL_SIZE }}
        >
          {Array.from({ length: board.width }).map((_, colIndex) => (
            <div
              key={`bottom-slot-${colIndex}`}
              style={{
                width: CELL_SIZE,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ArrowButton
                axis="COL"
                index={colIndex}
                direction="UP"
                onClick={onArrowClick}
              >
                <MdOutlineKeyboardArrowUp />
              </ArrowButton>
            </div>
          ))}
        </div>
      )}

      {!isSpectator && (
        <>
          <div className="mt-4 w-[600px] max-w-full rounded-2xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] px-4 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap justify-center gap-3">
              <SimpleButton
                title="Rotate"
                onClick={onRotateClick}
                disabled={!canRotate || isSubmittingMove}
                className="w-auto px-3 py-1"
                textClassName="text-sm mb-0"
              />
              <SimpleButton
                title="Swap"
                onClick={onSwapClick}
                disabled={!canSwap || isSubmittingMove}
                className="w-auto px-3 py-1"
                textClassName="text-sm mb-0"
              />
              <SimpleButton
                title="Confirm Move"
                onClick={submitMovePath}
                disabled={
                  !selectedPlayer || movePath.length === 0 || isSubmittingMove
                }
                className="w-auto px-3 py-1"
                textClassName="text-sm mb-0"
              />
              <SimpleButton
                title="Cancel Path"
                onClick={resetMoveSelection}
                disabled={!selectedPlayer || isSubmittingMove}
                className="w-auto px-3 py-1"
                textClassName="text-sm mb-0"
              />
              <SimpleButton
                title="Skip move"
                onClick={onSkipClick}
                disabled={isSubmittingMove}
                className="w-auto px-3 py-1"
                textClassName="text-sm mb-0"
              />
            </div>

            {selectedPlayer && (
              <p className="mt-3 text-center text-xs text-white/60">
                {movePath.length > 0
                  ? "Path ready. Click selected player again or press Confirm Move."
                  : "Move mode: click adjacent tiles to build path."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
