// src/components/game/GameStatusDot.tsx

import { useNavigate } from "react-router-dom";
import StatusDot from "../shared/StatusDot";
import { usePlayerAvailability } from "../../hooks/usePlayerAvailability";

interface GameStatusDotProps {
  user: { id?: string } | null;
}

export default function GameStatusDot({ user }: GameStatusDotProps) {
  const navigate = useNavigate();


  const { availability: activeGame, loading, error } = usePlayerAvailability(user);

  if (!user) return null;

  return (
    <button
      type="button"
      title={activeGame ? "Active game" : error ? error : "No active game"}
      className="inline-flex items-center gap-2 text-sm text-white disabled:cursor-default"
      style={{ cursor: activeGame ? "pointer" : "default" }}
      onClick={() => {
        if (activeGame) {
          navigate(
            activeGame.phase === "PLAY"
              ? `/game/${activeGame.gameId}`
              : `/multiplayer/lobby/${activeGame.gameId}`,
          );
        }
      }}
      disabled={!activeGame || loading}
      aria-label={activeGame ? "Go to active game" : error ? error : "No active game"}
    >
      <StatusDot active={Boolean(activeGame)} className="w-2.5 h-2.5" />
      {/* {activeGame ? <span>Continue game</span> : error ? <span>{error}</span> : <span>No active game</span>} */}
    </button>
  );
}
