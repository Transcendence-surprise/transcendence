// // multiplayer lobby

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

  // Websocket for update game state
  useEffect(() => {
    if (!gameId || !user?.id) {
      // redirect if we can't determine user
      navigate("/game");
      return;
    }

    const socket = getSocket() ?? connectSocket();

    const handleConnect = () => {
      console.log("Socket connected -> now joining lobby");
      socket.emit("joinLobby", { gameId });
    };

    if (socket.connected) {
      socket.emit("joinLobby", { gameId });
    } else {
      socket.on("connect", handleConnect)
    }

    const handleLobbyUpdate = (data: any) => {
      console.log("LOBBY UPDATE RECEIVED", data);
      setGame({
        id: data.gameId,
        hostName: data.host,
        players: data.players,
        rules: data.rules,
        phase: data.phase,
      });
      console.log("Game after set:", game);
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);

    const handleLobbyMessage = (msg: any) => {
      console.log("LOBBY MESSAGE", msg);
      setMessages(prev => [...prev, msg]);
    };

    socket.on("lobbyMessage", handleLobbyMessage);

    const handleError = (err: any) => {
      console.log("LOBBY ERROR", err);
      setError(err.error || "Failed to join lobby");
    };

    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("lobbyMessage", handleLobbyMessage);
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

      await startGame(gameId);

      const updatedGame = await getGameState(gameId);
      setGame(updatedGame);

      // backend switched phase → PLAY
      if (updatedGame.phase === "PLAY") {
        navigate(`/game/${gameId}`);
      }
    } catch (err: any) {
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
