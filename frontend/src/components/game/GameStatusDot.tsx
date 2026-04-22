import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRealtimeSocket, connectRealtimeSocket } from "../../services/realtimeSocket";
import StatusDot from "../UI/StatusDot";

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

    // Real-time: listen for playerStatus/playerGameStatus events
    const socket = getRealtimeSocket() ?? connectRealtimeSocket();
    const requestStatus = () => {
      socket.emit("checkPlayerStatus");
    };

    if (socket.connected) {
      requestStatus();
    } else {
      socket.on("connect", requestStatus);
    }

    const handleStatus = (data: any) => {
      if (data && !data.ok && data.gameId) {
        setActiveGame({ gameId: data.gameId, phase: data.phase });
      } else {
        setActiveGame(null);
      }
    };
    socket.on("playerStatus", handleStatus);
    socket.on("playerGameStatus", handleStatus);
    return () => {
      socket.off("connect", requestStatus);
      socket.off("playerStatus", handleStatus);
      socket.off("playerGameStatus", handleStatus);
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
