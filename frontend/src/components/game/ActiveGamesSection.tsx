import { useEffect, useState } from "react";
import { checkPlayerAvailability } from "../../api/game";
import { useNavigate } from "react-router-dom";
import { connectSocket, getSocket } from "../../services/socket";

interface ActiveGamesSectionProps {
  user: { username: string } | null;
}

export default function ActiveGamesSection({ user }: ActiveGamesSectionProps) {
  const navigate = useNavigate();
  const [activeGameIds, setActiveGameIds] = useState<string[]>([]);
  const [loadingGame, setLoadingGame] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const checkActive = async () => {
      if (!user) {
        setActiveGameIds([]);
        return;
      }

      try {
        const availability = await checkPlayerAvailability(controller.signal);

        if (!availability.ok && availability.gameId) {
          setActiveGameIds([availability.gameId]);
        } else {
          setActiveGameIds([]);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setActiveGameIds([]);
        }
      }
    };

    checkActive();

    const socket = getSocket() ?? connectSocket();

    const handleStatus = (data: any) => {
      if (!data.ok && data.gameId) {
        setActiveGameIds([data.gameId]);
      } else {
        setActiveGameIds([]);
      }
    };

    socket.on("playerStatus", handleStatus);

    return () => {
      controller.abort();
      socket.off("playerStatus", handleStatus);
    };
  }, [user]);

  return (
    <>
      <h2 className="text-4xl font-bold drop-shadow-lg m-0 mb-4">
        Active Games
      </h2>

      {/* Active Games Section */}
      {activeGameIds.length > 0 ? (
        <div className="w-full max-w-md px-4 mb-8">
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
                      const controller = new AbortController();
                      setLoadingGame(true);
                      try {
                        const availability = await checkPlayerAvailability(controller.signal);
                        if (!availability.ok && availability.gameId) {
                          navigate(
                            availability.phase === "PLAY"
                              ? `/game/${availability.gameId}`
                              : `/multiplayer/lobby/${availability.gameId}`
                          );
                        } else {
                          navigate(`/game/${gameId}`);
                        }
                      } catch (err: any) {
                        if (err?.name !== "AbortError") {
                          console.error(err);
                        }
                      } finally {
                        controller.abort();
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
        <div className="w-full max-w-md px-4 mb-8">
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
