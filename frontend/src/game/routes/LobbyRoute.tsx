// src/game/routes/LobbyRoute.tsx

import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { getRealtimeSocket } from "../../services/realtimeSocket";
import { getGameState, startGame, leaveGame } from "../../api/game";
import Lobby from "../../components/game/Lobby";
import { useAuth } from "../../hooks/useAuth";
import { useGameMessages } from "../../hooks/useGameMessages";
import { enrichGamePlayers } from "../utils/enrichGamePlayers";
import { useUsersMap } from "../../hooks/useUsersMap";

export default function LobbyRoute() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();

  const [input, setInput] = useState("");
  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const fetchControllerRef = useRef<AbortController | null>(null);

  const { userById, userByUsername } = useUsersMap(user);
  const { messages } = useGameMessages(
    gameId,
    userByUsername,
  );

  const fetchGame = useCallback(async () => {
    if (!gameId) return;

    // abort ONLY previous fetchGame request
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    try {
      const res = await getGameState(gameId, controller.signal);

      if (!res) {
        navigate("/game", {
          state: { message: "Lobby was closed" },
        });
        return;
      }

      setGame(enrichGamePlayers(res, userById));

      if (res.phase === "PLAY") {
        navigate(`/game/${gameId}`);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;

      if (err?.message?.includes("GAME_NOT_FOUND")) {
        navigate("/game", {
          state: { message: "Lobby was closed" },
        });
        return;
      }

      console.error(err);
      setError("Failed to load game");
    }
  }, [gameId, navigate]);

  useEffect(() => {
    if (!user || !gameId) {
      navigate("/game");
      return;
    }
    fetchGame();
  }, [user, gameId, fetchGame, navigate]);

  useEffect(() => {
    if (!gameId) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    const handleLobbyUpdated = async ({ gameId: updatedId }: any) => {
      if (updatedId !== gameId) return;

      const res = await getGameState(gameId);
      setGame(enrichGamePlayers(res, userById));

      if (res.phase === "PLAY") {
        navigate(`/game/${gameId}`);
      }
    };

    socket.on("lobby:updated", handleLobbyUpdated);

    return () => {
      socket.off("lobby:updated", handleLobbyUpdated);
    };
  }, [gameId, userById, navigate]);

  // Start game (host only)
  const handleStart = async () => {
    if (!gameId) return;

    setStartError(null);
    setStarting(true);

    try {
      setError(null);

      await startGame(gameId);

      const updatedGame = await getGameState(gameId);
      setGame(updatedGame);

      // backend switched phase → PLAY
      if (updatedGame.phase === "PLAY") {
        navigate(`/game/${gameId}`);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error(err);
      const errorMsg = err.message || "Cannot start game yet";
      if (errorMsg.includes("NOT_ENOUGH_PLAYERS")) {
        setStartError("Not enough players to start the game");
      } else if (errorMsg.includes("NOT_HOST")) {
        setStartError("Only the host can start the game");
      } else {
        setStartError(errorMsg);
      }
    } finally {
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    if (!gameId) return;

    setLeaveError(null);

    const res = await leaveGame(gameId);

    if (res.ok) {
      navigate("/multiplayer/join");
    } else {
      console.warn("Leave failed:", res.error);
      setLeaveError(res.error || "Leave failed");
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !gameId) return;

    const socket = getRealtimeSocket(); // get the existing socket instance
    if (!socket || !input.trim() || !gameId) return;

    socket.emit("lobbyMessage", {
      gameId,
      message: input,
    });

    setInput("");
  };

  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Loading...</div>;

  return (
    <Lobby
      game={game}
      currentUserId={user?.id}
      onGameStarted={handleStart}
      onGameLeave={handleLeave}
      error={startError}
      starting={starting}
      leaveError={leaveError}
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
    />
  );
}
