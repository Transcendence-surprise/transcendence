import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectRealtimeSocket, getRealtimeSocket } from "../../services/realtimeSocket";

interface ActiveGamesSectionProps {
  user: { username: string } | null;
}

export default function ActiveGamesSection({ user }: ActiveGamesSectionProps) {
  const navigate = useNavigate();
  const [activeGameIds, setActiveGameIds] = useState<string[]>([]);
  const [loadingGame, setLoadingGame] = useState(false);

  useEffect(() => {
    if (!user) {
      setActiveGameIds([]);
      return;
    }

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
      if (!data.ok && data.gameId) {
        setActiveGameIds([data.gameId]);
      } else {
        setActiveGameIds([]);
      }
    };

    socket.on("playerStatus", handleStatus);

    return () => {
      socket.off("connect", requestStatus);
      socket.off("playerStatus", handleStatus);
    };
  }, [user]);

  return (
    <>
      <h2 className="text-4xl font-bold drop-shadow-lg m-0 mb-1">
        Active Games
      </h2>

      {/* Active Games Section */}
      {activeGameIds.length > 0 ? (
        <div className="w-full max-w-md px-4">
          <div className="space-y-2">
            {activeGameIds.map((gameId) => (
              <div
                key={gameId}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-green-400 font-semibold text-sm">
                        Game in Progress
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {gameId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setLoadingGame(true);
                      try {
                        navigate(`/game/${gameId}`);
                      } catch (err: any) {
                        if (err?.name !== "AbortError") {
                          console.error(err);
                        }
                      } finally {
                        setLoadingGame(false);
                      }
                    }}
                    disabled={loadingGame}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded text-sm transition-colors font-semibold whitespace-nowrap"
                  >
                    {loadingGame ? "Loading..." : "Resume"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Gray box when no active games or not logged in
        <div className="w-full max-w-md px-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400">
              {user
                ? "You have no active games right now."
                : "You are not logged in. No active games available."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
