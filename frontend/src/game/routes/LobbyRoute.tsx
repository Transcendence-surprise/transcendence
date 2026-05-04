// // multiplayer lobby

import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { getRealtimeSocket } from "../../services/realtimeSocket";
import { getGameState, startGame, leaveGame } from "../../api/game";
import Lobby from "../../components/game/Lobby";
import { LobbyMessage } from "../models/lobbyMessage";
import { useAuth } from "../../hooks/useAuth";
import { getAllUsers } from "../../api/users";

function enrichLobbyMessage(
  message: LobbyMessage,
  userByUsername: Map<string, { id: string; avatarUrl: string | null }>,
): LobbyMessage {
  const matchedUser = userByUsername.get(message.userName);

  return {
    ...message,
    userId: message.userId ?? matchedUser?.id,
    avatarUrl: message.avatarUrl ?? matchedUser?.avatarUrl ?? null,
  };
}

function enrichGamePlayers(
  gameState: any,
  userById: Map<string, { avatarUrl: string | null }>,
) {
  if (!gameState || !Array.isArray(gameState.players)) {
    return gameState;
  }

  return {
    ...gameState,
    players: gameState.players.map((player: any) => ({
      ...player,
      avatarUrl:
        player.avatarUrl ??
        userById.get(String(player.id))?.avatarUrl ??
        null,
    })),
  };
}

export default function LobbyRoute() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [input, setInput] = useState("");
  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const fetchControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef(0);

  const joinedRef = useRef(false);
  const userByIdRef = useRef<Map<string, { avatarUrl: string | null }>>(new Map());
  const userByUsernameRef = useRef<Map<string, { id: string; avatarUrl: string | null }>>(new Map());

  const fetchGame = useCallback(async () => {
    if (!gameId) return;

    // abort ONLY previous fetchGame request
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    try {
      const [res, allUsers] = await Promise.all([
        getGameState(gameId, controller.signal),
        getAllUsers(controller.signal),
      ]);

      userByIdRef.current = new Map(
        allUsers.map((appUser) => [
          String(appUser.id),
          { avatarUrl: appUser.avatarUrl ?? null },
        ]),
      );
      userByUsernameRef.current = new Map(
        allUsers.map((appUser) => [
          appUser.username,
          {
            id: String(appUser.id),
            avatarUrl: appUser.avatarUrl ?? null,
          },
        ]),
      );

      if (!res) {
        navigate("/game", {
          state: { message: "Lobby was closed" },
        });
        return;
      }

      setGame(enrichGamePlayers(res, userByIdRef.current));

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

  // Websocket for update game state
  const handleLobbyMessage = useCallback((msg: any) => {
    setMessages((prev) => [
      ...prev,
      enrichLobbyMessage(msg, userByUsernameRef.current),
    ]);
  }, []);

  useEffect(() => {
    if (!gameId || !user?.id) {
      navigate("/game");
      return;
    }

    const socket = getRealtimeSocket();

    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    const join = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;

      socket.emit("game:join", { gameId });
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }

    const handleLobbyUpdated = (p: { gameId: string }) => {
      if (p.gameId !== gameId) return;

      const now = Date.now();
      if (now - lastFetchRef.current < 300) return;

      lastFetchRef.current = now;
      fetchGame();
    };

    const handleError = (err: any) => {
      setError(err.error || "Failed to join lobby");
    };

    socket.on("lobby:updated", handleLobbyUpdated);
    socket.on("lobbyMessage", handleLobbyMessage);
    socket.on("error", handleError);

    return () => {
      fetchControllerRef.current?.abort();
      joinedRef.current = false;

      socket.off("connect", join);
      socket.off("lobby:updated", handleLobbyUpdated);
      socket.off("lobbyMessage", handleLobbyMessage);
      socket.off("error", handleError);
    };
  }, [gameId, user, fetchGame, navigate, handleLobbyMessage]);

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
