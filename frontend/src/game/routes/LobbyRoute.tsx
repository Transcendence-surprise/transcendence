// // multiplayer lobby

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket, getSocket } from "../../services/socket";
import { getGameState, startGame, leaveGame } from "../../api/game";
import Lobby from "../../components/game/Lobby";
import { LobbyMessage } from "../models/lobbyMessage";
import { useAuth } from "../../hooks/useAuth";

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
  const requestControllerRef = useRef<AbortController | null>(null);

  const nextSignal = () => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = new AbortController();
    return requestControllerRef.current.signal;
  };

  // Websocket for update game state
  useEffect(() => {
    if (!gameId || !user?.id) {
      // redirect if we can't determine user
      navigate("/game");
      return;
    }

    const socket = getSocket() ?? connectSocket();

    const handleConnect = () => {
      socket.emit("joinLobby", { gameId });
    };

    if (socket.connected) {
      socket.emit("joinLobby", { gameId });
    } else {
      socket.on("connect", handleConnect)
    }

    const handleLobbyUpdate = (data: any) => {
        setGame({
          id: data.gameId,
          hostName: data.host,
          players: data.players,
          rules: data.rules,
          phase: data.phase,
        });
        // If phase changed to PLAY, navigate to board
        if (data.phase === "PLAY") {
          navigate(`/game/${data.gameId}`);
        }
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);

    const handleLobbyMessage = (msg: any) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on("lobbyMessage", handleLobbyMessage);

    const handleLobbyDeleted = (data: { gameId: string }) => {
      if (data.gameId === gameId) {
        alert("The host left and the lobby was closed!");
        navigate("/game");
      }
    };

    socket.on("lobbyDeleted", handleLobbyDeleted);

    const handleError = (err: any) => {
      setError(err.error || "Failed to join lobby");
    };

    socket.on("error", handleError);

    return () => {
      requestControllerRef.current?.abort();
      socket.off("connect", handleConnect);
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("lobbyMessage", handleLobbyMessage);
      socket.off("lobbyDeleted", handleLobbyDeleted);
      socket.off("error", handleError); 
    };
  }, [gameId, user, navigate]);

  // Start game (host only)
  const handleStart = async () => {
    if (!gameId) return;

    setStartError(null);
    setStarting(true);

    try {
      setError(null);

      const signal = nextSignal();

      await startGame(gameId, signal);

      const updatedGame = await getGameState(gameId, signal);
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
    const signal = nextSignal();

    const res = await leaveGame(gameId, signal);

    if (res.ok) {
      navigate("/multiplayer/join");
    } else {
      console.warn("Leave failed:", res.error);
      setLeaveError(res.error || "Leave failed");
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !gameId) return;

    const socket = getSocket(); // get the existing socket instance
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
