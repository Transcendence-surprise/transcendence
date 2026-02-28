// // multiplayer lobby

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { socket } from "../../services/socket";
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

    if (socket.connected) {
      socket.emit("joinLobby", { gameId });
    } else {
      socket.on("connect", () => {
        console.log("Socket connected -> now joining lobby");
        socket.emit("joinLobby", { gameId });
      })
    }

    socket.on("lobbyUpdate", (data) => {
      console.log("LOBBY UPDATE RECEIVED", data);
      setGame({
        id: data.gameId,
        hostName: data.host,
        players: data.players,
        rules: data.rules,
        phase: data.phase,
      });
    console.log("Game after set:", game);
    });

    socket.on("lobbyMessage", (msg) => {
      console.log("LOBBY MESSAGE", msg);
      setMessages(prev => [...prev, msg]);
    });

    socket.on("error", (err) => {
      console.log("LOBBY ERROR", err);
      setError(err.error || "Failed to join lobby");
    });

    return () => {
      socket.off("connect");
      socket.off("lobbyUpdate");
      socket.off("lobbyMessage");
      socket.off("error"); 
    };
  }, [gameId]);

  // Start game (host only)
  const handleStart = async () => {
    if (!gameId) return;

    setStartError(null);
    setStarting(true);

    try {
      setStarting(true);
      setError(null);

      const res = await startGame(gameId!);

      if (!res.ok) {
        console.warn("Cannot start game:", res.error);
        if (res.error === "NOT_ENOUGH_PLAYERS") {
          setStartError("Not enough players to start the game");
        } else if (res.error === "NOT_HOST") {
          setStartError("Only the host can start the game");
        } else {
          setStartError("Cannot start game");
        }
      return;
    }
      const updatedGame = await getGameState(gameId!);
      setGame(updatedGame);

      // backend switched phase → PLAY
      if (updatedGame.phase === "PLAY") {
        navigate(`/game/${gameId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Cannot start game yet");
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
