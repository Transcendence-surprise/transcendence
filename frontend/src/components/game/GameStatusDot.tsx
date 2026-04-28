// src/components/game/GameStatusDot.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRealtimeSocket, connectRealtimeSocket } from "../../services/realtimeSocket";
import StatusDot from "../shared/StatusDot";
import { checkPlayerAvailability } from "../../api/game";

interface GameStatusDotProps {
  user: { id?: string } | null;
}

export default function GameStatusDot({ user }: GameStatusDotProps) {
  const navigate = useNavigate();

  const [activeGame, setActiveGame] = useState<{
    gameId: string;
    phase: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setActiveGame(null);
      return;
    }

    const socket = getRealtimeSocket() ?? connectRealtimeSocket();
    const controller = new AbortController();

    const loadStatus = async () => {
      try {
        const data = await checkPlayerAvailability(controller.signal);

        if (data?.gameId) {
          setActiveGame({
            gameId: data.gameId,
            phase: data.phase,
          });
        } else {
          setActiveGame(null);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Failed to load player status");
        }
      }
    };

    // initial fetch
    loadStatus();

    // WS trigger → refetch status
    socket.on("playerAvailability:updated", loadStatus);

    return () => {
      controller.abort();
      socket.off("playerAvailability:updated", loadStatus);
    };
  }, [user]);

  if (!user) return null;

  return (
    <button
      type="button"
      title={activeGame ? "Active game" : "No active game"}
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
      disabled={!activeGame}
      aria-label={activeGame ? "Go to active game" : "No active game"}
    >
      <StatusDot active={Boolean(activeGame)} className="w-3 h-3" />
      {activeGame ? <span>Continue game</span> : <span>No active game</span>}
    </button>
  );
}
