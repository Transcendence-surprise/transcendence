import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkPlayerAvailability } from "../../api/game";
import { getSocket, connectSocket } from "../../services/socket";

interface GameStatusDotProps {
  user: { id?: string } | null;
}

export default function GameStatusDot({ user }: GameStatusDotProps) {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<{ gameId: string; phase: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    // Fallback: HTTP check on mount/user change
    const check = async () => {
      if (!user) {
        setActiveGame(null);
        return;
      }
      try {
        console.log(`!!! Checking player availability at front for user: ${user.id}`);
        const availability = await checkPlayerAvailability();
        if (!ignore) {
          if (!availability.ok && availability.gameId) {
            setActiveGame({ gameId: availability.gameId, phase: availability.phase });
          } else {
            setActiveGame(null);
          }
        }
      } catch {
        if (!ignore) setActiveGame(null);
      }
    };
    check();

    // Real-time: listen for playerStatus/playerGameStatus events
    const socket = getSocket() ?? connectSocket();
    const handleStatus = (data: any) => {
      if (ignore) return;
      if (data && !data.ok && data.gameId) {
        console.log(`Player has an active game:`, data);
        setActiveGame({ gameId: data.gameId, phase: data.phase });
      } else {
        console.log(`No active game for user`, data);
        setActiveGame(null);
      }
    };
    socket.on("playerStatus", handleStatus);
    socket.on("playerGameStatus", handleStatus);
    return () => {
      ignore = true;
      socket.off("playerStatus", handleStatus);
      socket.off("playerGameStatus", handleStatus);
    };
  }, [user]);

  if (!user) return null;

  return (
    <span
      title={activeGame ? "Active game" : "No active game"}
      style={{ cursor: activeGame ? "pointer" : "default", fontSize: "1.5em", lineHeight: 1 }}
      onClick={() => {
        if (activeGame) {
          navigate(
            activeGame.phase === "PLAY"
              ? `/game/${activeGame.gameId}`
              : `/multiplayer/lobby/${activeGame.gameId}`
          );
        }
      }}
      aria-label={activeGame ? "Go to active game" : "No active game"}
    >
      {activeGame ? "🟢 Continue game" : "⚪"}
    </span>
  );
}
