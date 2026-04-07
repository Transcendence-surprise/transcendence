// src/components/game/BoardView.tsx
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "../../game/models/board";
import { useDrawBoard } from "../../hooks/useDrawBoard";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useGameActions } from "../../hooks/useGameActions";
import { PlayerState } from "../../game/models/privatState";
import { BoardCanvas } from "./BoardCanvas";

type Props = {
  board: Board;
  players: PlayerState[];
  currentPlayerId: string | number;
  gameId: string;
};

export default function BoardView({ board, players, currentPlayerId, gameId }: Props) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  console.log("Player State in BoardView:", players.map(p => ({ id: p.id, slot: p.slotId, x: p.x, y: p.y, hasMoved: p.hasMoved, skipsLeft: p.skipsLeft })));

  // --- Keyboard navigation ---
  const { selectedButton, setSelectedButton, handleKeyDown } =
    useKeyboardNavigation(board.width, board.height);

  // --- Draw board (pure render from server state) ---
  useDrawBoard(canvasRef, board, players);

  // --- Game actions (API driven) ---
  const {
    handleRowClick,
    handleColClick,
    handleRotateTile,
    handleSwapTiles,
    handlePlayerAction,
    handleLeaveGame,
    handleSkip,
  } = useGameActions(gameId, setSelectedButton, navigate);

  // Actions
  const handleArrowClick = async (
    axis: "ROW" | "COL",
    index: number,
    direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
  ) => {
    if (axis === "ROW") {
      await handleRowClick(index, direction === "LEFT" ? "left" : "right");
    } else {
      await handleColClick(index, direction === "UP" ? "up" : "down");
    }
  };

  const [selectedTiles, setSelectedTiles] = useState<{ x: number; y: number }[]>([]);

  // Swap button pressed
  const handleSwapButton = async () => {
    if (selectedTiles.length !== 2) {
      alert("Select two tiles to swap!");
      return;
    }

    const [t1, t2] = selectedTiles;

    const dx = Math.abs(t1.x - t2.x);
    const dy = Math.abs(t1.y - t2.y);

    const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

    if (!isAdjacent) {
      alert("Tiles must be adjacent!");
      return;
    }

    await handleSwapTiles(t1.x, t1.y, t2.x, t2.y);

    setSelectedTiles([]);
  };

  const handleRotateButton = async () => {
    if (selectedTiles.length !== 1) {
      alert("Select ONE tile to rotate");
      return;
    }

    const { x, y } = selectedTiles[0];

    await handleRotateTile(x, y);

    setSelectedTiles([]);
  };

  const handlePlayerMove = async (path: { x: number; y: number }[]) => {
    // Backend validator starts from current player position and expects
    // `path` to contain only destination steps (not the current position).
    await handlePlayerAction(path);
  };

  return (
    <div className="flex flex-col items-center gap-2" onKeyDown={(e) => handleKeyDown(e, buttonRefs)}>
      <BoardCanvas
        board={board}
        players={players}
        currentPlayerId={currentPlayerId}
        selectedTiles={selectedTiles}
        setSelectedTiles={setSelectedTiles}
        onArrowClick={handleArrowClick}
        onPlayerMove={handlePlayerMove}
        onRotateClick={handleRotateButton}
        onSwapClick={handleSwapButton}
        onSkipClick={handleSkip}
        canRotate={selectedTiles.length === 1}
        canSwap={selectedTiles.length === 2}
      />

      {/* Navigation buttons */}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-2)}
          className="py-3 px-6 rounded-lg font-medium text-white bg-bg-dark-tertiary border border-[var(--color-border-subtle)] hover:shadow-cyan-light hover:border-cyan-bright transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleLeaveGame}
          className="py-3 px-6 rounded-lg font-medium text-white bg-bg-dark-tertiary border border-[var(--color-border-subtle)] hover:shadow-cyan-light hover:border-cyan-bright transition-all"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
}