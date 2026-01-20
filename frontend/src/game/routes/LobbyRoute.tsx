// // multiplayer lobby

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { socket } from "../../services/socket";
import { getGameState, startGame } from "../../api/game";
import Lobby from "../../components/game/Lobby";

export default function LobbyRoute() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const location = useLocation();

  const { currentUserId } = location.state as { currentUserId: string; };

  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Websocket for update game state
  useEffect(() => {
    if (!gameId || !currentUserId) return;

    socket.emit("joinLobby", { gameId, userId: currentUserId });

    socket.on("lobbyUpdate", (data) => {
      setGame({
        id: data.gameId,
        hostId: data.host,
        players: data.players,
        rules: { maxPlayers: data.maxPlayers },
        phase: data.phase,
      });
      console.log(data.players);
    });

    return () => {
      socket.off("lobbyUpdate");
    };
  }, [gameId, currentUserId]);

  // Start game (host only)
  const handleStart = async () => {
    if (!gameId) return;

    setStartError(null);
    setStarting(true);

    try {
      setStarting(true);
      setError(null);

      const res = await startGame(gameId!, currentUserId);

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

  if (!game) return <div>Loading...</div>;

  return (
    <Lobby
      game={game}
      currentUserId={currentUserId}
      onGameStarted={handleStart}
      error={startError}
      starting={starting}
    />
  );
}
