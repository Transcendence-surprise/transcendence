// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { connectSocket } from "../../services/socket";
import { useAuth } from '../../hooks/useAuth';
import GamePage from "../../pages/GamePage";
import { PrivateGameState } from "../models/privatState";
import { getGameState } from "../../api/game";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Game ID is required");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [game, setGame] = useState<PrivateGameState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !user) return;

    const socket = connectSocket();

    setLoading(true);
    getGameState(id)
      .then((g) => {
        setGame(g);

    // join play room
    socket.emit("joinPlay", { gameId: id, userId: user.id });

    // listen for updates
    const handlePlayUpdate = (data: Partial<PrivateGameState> & { playerProgress?: any }) => {
      setGame((prev) => {
        if (!prev) return prev;

        let nextPlayerProgress = prev.playerProgress;
        const incomingProgress = data.playerProgress;

        // WS can send either private `PlayerProgress` or full map keyed by playerId.
        // Normalize to current user's private progress so sidebar objectives render correctly.
        if (incomingProgress) {
          if (Array.isArray(incomingProgress.objectives)) {
            nextPlayerProgress = incomingProgress;
          } else if (user?.id != null && typeof incomingProgress === "object") {
            const mine = incomingProgress[user.id.toString()];
            if (mine && Array.isArray(mine.objectives)) {
              nextPlayerProgress = mine;
            }
          }
        }

        return {
          ...prev,
          ...data,
          playerProgress: nextPlayerProgress,
        };
      });
    };
    socket.on("playUpdate", handlePlayUpdate);

    // Listen for game deleted
    const handleGameDeleted = (data: { gameId: string }) => {
      if (data.gameId === id) {
        alert("Game was deleted by host");
        navigate("/game");
      }
    };
    socket.on("gameDeleted", handleGameDeleted);

    // listen for errors
    socket.on("error", (err) => {
      setError(err.error || "Failed to join play");
    });
    })
    .catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load game")
    )
    .finally(() => setLoading(false));

    return () => {
      socket.off("playUpdate");
      socket.off("gameDeleted");
      socket.off("error");
    };
  }, [id, navigate, user]);

  useEffect(() => {
    if (!id || game?.phase !== "END") return;

    // Some play updates can arrive with phase only.
    // Refetch final state to guarantee gameResult/winnerIds are present.
    getGameState(id)
      .then((finalState) => setGame(finalState))
      .catch(() => {
        // keep current state; popup will use fallbacks
      });
  }, [id, game?.phase]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  const rawResult = game.gameResult as { winnerIds?: (string | number)[]; winnerId?: string | number } | undefined;
  const winnerIds = (
    rawResult?.winnerIds?.map((winnerId) => winnerId.toString())
    ?? (rawResult?.winnerId ? [rawResult.winnerId.toString()] : [])
  );
  const myId = user?.id?.toString();
  const iWon = !!myId && winnerIds.includes(myId);
  const mappedWinnerNames = game.players
    .filter((p) => winnerIds.includes(p.id.toString()))
    .map((p) => p.name)
    .join(", ");
  const winnerNames = mappedWinnerNames || (iWon ? user?.username ?? "You" : "");

  if (game.phase === "END") {
    return (
      <div className="relative">
        <GamePage game={game} gameId={id} />

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-center">
              {iWon ? "🏆 You won!" : "Game finished"}
            </h2>
            <p className="text-center text-gray-300 mb-6">
              {winnerNames ? `Winner: ${winnerNames}` : "No winner information"}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate("/game")}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                Back to games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (game.phase === "PLAY") {
    return <GamePage game={game} gameId={id} />;
  }
  return <div>Game ended</div>;
}
