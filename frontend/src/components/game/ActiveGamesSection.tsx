// src/components/game/ActiveGamesSection.tsx

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePlayerAvailability, type PlayerAvailability } from "../../hooks/usePlayerAvailability";

interface ActiveGamesSectionProps {
  user: { id?: string | number } | null;
}

function hasActiveGame(
  availability: PlayerAvailability | null,
): availability is PlayerAvailability & { gameId: string } {
  return !!availability?.gameId;
}

export default function ActiveGamesSection({ user }: ActiveGamesSectionProps) {
  const navigate = useNavigate();
  const { availability, loading, error, hydrated } = usePlayerAvailability(user);
  const [loadingGame, setLoadingGame] = useState(false);

  const hasActiveGame = !!availability?.gameId;

  if (!user) {
    return (
      <div className="w-full max-w-md px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400">
            You are not logged in. No active games available.
          </p>
        </div>
      </div>
    );
  }

  if (!hydrated || loading) {
    return (
      <div className="w-full max-w-md px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400">Checking active games...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-4xl font-bold drop-shadow-lg m-0 mb-1">
        Active Games
      </h2>

      {/* Active Games Section */}
      {hasActiveGame ? (
        <div className="w-full max-w-md px-4">
          <div className="space-y-2">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3" >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-green-400 font-semibold text-sm">
                      Game in Progress
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {availability!.gameId!.slice(0, 8)}..
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const gameId = availability!.gameId!;
                    setLoadingGame(true);

                    try {
                      navigate(
                        availability!.phase === "PLAY"
                          ? `/game/${gameId}`
                          : `/multiplayer/lobby/${gameId}`,
                      );
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
          </div>
        </div>
      ) : (
        // Gray box when no active games or not logged in
        <div className="w-full max-w-md px-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400">
              {error
                ? error
                : user
                ? "You have no active games right now."
                : "You are not logged in. No active games available."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
