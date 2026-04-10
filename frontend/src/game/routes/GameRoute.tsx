// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../../services/socket";
import { useAuth } from "../../hooks/useAuth";
import GamePage from "../../pages/GamePage";
import { PlayerProgress, PrivateGameState } from "../models/privatState";
import { getGameState } from "../../api/game";
import { LobbyMessage } from "../models/lobbyMessage";

function isPlayerProgress(value: unknown): value is PlayerProgress {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as PlayerProgress).objectives)
  );
}

function isPlayerProgressMap(
  value: unknown,
): value is Record<string, PlayerProgress> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(isPlayerProgress);
}

function resolveProgressState(params: {
  incomingPlayerProgress?: unknown;
  incomingPlayerProgressById?: unknown;
  previousPlayerProgress: PlayerProgress;
  previousPlayerProgressById?: Record<string, PlayerProgress>;
  currentUserId?: string | number;
}) {
  const {
    incomingPlayerProgress,
    incomingPlayerProgressById,
    previousPlayerProgress,
    previousPlayerProgressById,
    currentUserId,
  } = params;

  let nextPlayerProgress = previousPlayerProgress;
  let nextPlayerProgressById = previousPlayerProgressById;

  if (isPlayerProgressMap(incomingPlayerProgressById)) {
    nextPlayerProgressById = incomingPlayerProgressById;
  }

  if (isPlayerProgressMap(incomingPlayerProgress)) {
    nextPlayerProgressById = incomingPlayerProgress;
  } else if (isPlayerProgress(incomingPlayerProgress)) {
    nextPlayerProgress = incomingPlayerProgress;
  }

  if (currentUserId != null && nextPlayerProgressById) {
    const mine = nextPlayerProgressById[currentUserId.toString()];
    if (isPlayerProgress(mine)) {
      nextPlayerProgress = mine;
    }
  }

  return { nextPlayerProgress, nextPlayerProgressById };
}

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Game ID is required");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [game, setGame] = useState<PrivateGameState | null>(null);
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const endStateRefetchedRef = useRef(false);

  useEffect(() => {
    if (!id || !user) return;

    const controller = new AbortController();

    const socket = connectSocket();

    const handlePlayUpdate = (
      data: Partial<PrivateGameState> & { playerProgress?: unknown },
    ) => {
      setGame((prev) => {
        if (!prev) return prev;

        const { nextPlayerProgress, nextPlayerProgressById } =
          resolveProgressState({
            incomingPlayerProgress: data.playerProgress,
            incomingPlayerProgressById: data.playerProgressById,
            previousPlayerProgress: prev.playerProgress,
            previousPlayerProgressById: prev.playerProgressById,
            currentUserId: user?.id,
          });

        return {
          ...prev,
          ...data,
          playerProgress: nextPlayerProgress,
          playerProgressById: nextPlayerProgressById,
        };
      });
    };

    const handlePlayMessage = (msg: LobbyMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleGameDeleted = (data: { gameId: string }) => {
      if (data.gameId === id) {
        alert("Game was deleted by host");
        navigate("/game");
      }
    };

    const handleError = (err: any) => {
      setError(err.error || "Failed to join play");
    };

    setLoading(true);
    getGameState(id, controller.signal)
      .then((g) => {
        const { nextPlayerProgress, nextPlayerProgressById } =
          resolveProgressState({
            incomingPlayerProgress: g.playerProgress,
            incomingPlayerProgressById: g.playerProgressById,
            previousPlayerProgress: g.playerProgress,
            previousPlayerProgressById: g.playerProgressById,
            currentUserId: user?.id,
          });

        setGame({
          ...g,
          playerProgress: nextPlayerProgress,
          playerProgressById: nextPlayerProgressById,
        });

        // join play room
        socket.emit("joinPlay", { gameId: id, userId: user.id });

        // listen for updates
        socket.on("playUpdate", handlePlayUpdate);
        socket.on("playMessage", handlePlayMessage);
        socket.on("gameDeleted", handleGameDeleted);
        socket.on("error", handleError);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Failed to load game");
        }
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
      socket.off("playUpdate", handlePlayUpdate);
      socket.off("playMessage", handlePlayMessage);
      socket.off("gameDeleted", handleGameDeleted);
      socket.off("error", handleError);
    };
  }, [id, navigate, user]);

  const sendPlayMessage = () => {
    if (!input.trim()) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("playMessage", {
      gameId: id,
      message: input,
    });

    setInput("");
  };

  useEffect(() => {
    if (
      !id ||
      game?.phase !== "END" ||
      game.gameResult ||
      endStateRefetchedRef.current
    )
      return;

    const controller = new AbortController();

    endStateRefetchedRef.current = true;
    getGameState(id, controller.signal)
      .then((finalState) => {
        const { nextPlayerProgress, nextPlayerProgressById } =
          resolveProgressState({
            incomingPlayerProgress: finalState.playerProgress,
            incomingPlayerProgressById: finalState.playerProgressById,
            previousPlayerProgress: finalState.playerProgress,
            previousPlayerProgressById: finalState.playerProgressById,
            currentUserId: user?.id,
          });

        setGame({
          ...finalState,
          playerProgress: nextPlayerProgress,
          playerProgressById: nextPlayerProgressById,
        });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Failed to refresh final game state:", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [id, game?.phase, game?.gameResult, user?.id]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  const rawResult = game.gameResult as
    | { winnerIds?: (string | number)[]; winnerId?: string | number }
    | undefined;
  const winnerIds =
    rawResult?.winnerIds?.map((winnerId) => winnerId.toString()) ??
    (rawResult?.winnerId ? [rawResult.winnerId.toString()] : []);
  const myId = user?.id?.toString();
  const iWon = !!myId && winnerIds.includes(myId);
  const mappedWinnerNames = game.players
    .filter((p) => winnerIds.includes(p.id.toString()))
    .map((p) => p.name)
    .join(", ");
  const winnerNames =
    mappedWinnerNames || (iWon ? (user?.username ?? "You") : "");
  const endReasonText =
    game.endReason === "LOSE_MAX_MOVES"
      ? "You lost: move limit reached."
      : game.endReason === "LOSE_TIME_LIMIT"
        ? "You lost: time limit reached."
        : null;

  if (game.phase === "END") {
    return (
      <div className="relative">
        <GamePage
          game={game}
          gameId={id}
          userId={user?.id}
          messages={messages}
          input={input}
          setInput={setInput}
          sendMessage={sendPlayMessage}
          showChat={game.players.length > 1}
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-center">
              {iWon
                ? "🏆 You won!"
                : endReasonText
                  ? "You lost"
                  : "Game finished"}
            </h2>
            <p className="text-center text-gray-300 mb-6">
              {winnerNames
                ? `Winner: ${winnerNames}`
                : (endReasonText ?? "No winner information")}
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
    return (
      <GamePage
        game={game}
        gameId={id}
        userId={user?.id}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendPlayMessage}
        showChat={game.players.length > 1}
      />
    );
  }
  return <div>Game ended</div>;
}
