// src/components/game/BoardView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../shared/BackButton";
import Alert from "../shared/Alert";
import { Board } from "../../game/models/board";
import { useGameActions } from "../../hooks/useGameActions";
import { PlayerState } from "../../game/models/privatState";
import { BoardCanvas } from "./BoardCanvas";

type Props = {
  board: Board;
  players: PlayerState[];
  currentPlayerId: string | number;
  gameId: string;
  boardActionsPending?: boolean;
  isSpectator?: boolean;
};

export default function BoardView({
  board,
  players,
  currentPlayerId,
  gameId,
  boardActionsPending = false,
  isSpectator = false,
}: Props) {
  const navigate = useNavigate();

  // --- Alert state ---
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("Notice");

  const showAlert = (message: string, title: string = "Notice") => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertOpen(true);
  };

  // --- Game actions (API driven) ---
  const {
    handleRowClick,
    handleColClick,
    handleRotateTile,
    handleSwapTiles,
    handlePlayerAction,
    handleLeaveGame,
    handleSkip,
  } = useGameActions(gameId, undefined, navigate, showAlert);

  // Actions
  const handleArrowClick = async (
    axis: "ROW" | "COL",
    index: number,
    direction: "UP" | "DOWN" | "LEFT" | "RIGHT",
  ) => {
    if (axis === "ROW") {
      await handleRowClick(index, direction === "LEFT" ? "left" : "right");
    } else {
      await handleColClick(index, direction === "UP" ? "up" : "down");
    }
  };

  const [selectedTiles, setSelectedTiles] = useState<
    { x: number; y: number }[]
  >([]);

  // Swap button pressed
  const handleSwapButton = async () => {
    if (selectedTiles.length !== 2) {
      showAlert("Select two tiles to swap!", "Swap Tiles");
      return;
    }

    const [t1, t2] = selectedTiles;

    const dx = Math.abs(t1.x - t2.x);
    const dy = Math.abs(t1.y - t2.y);

    const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

    if (!isAdjacent) {
      showAlert("Tiles must be adjacent!", "Swap Tiles");
      return;
    }

    await handleSwapTiles(t1.x, t1.y, t2.x, t2.y);

    setSelectedTiles([]);
  };

  const handleRotateButton = async () => {
    if (selectedTiles.length !== 1) {
      showAlert("Select ONE tile to rotate", "Rotate Tile");
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
    <div className="flex flex-col items-center gap-3">
      <Alert
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <div className="w-fit rounded-[1.75rem] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] px-5 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
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
          boardActionsPending={boardActionsPending}
          isSpectator={isSpectator}
        />
      </div>

      <div className="flex items-center justify-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))] px-4 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.16)]">
        <BackButton onClick={() => navigate(-2)} variant="outline" />
        <button
          type="button"
          onClick={handleLeaveGame}
          className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark-tertiary px-6 py-3 font-medium text-white transition-all hover:border-cyan-bright hover:shadow-cyan-light"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
}