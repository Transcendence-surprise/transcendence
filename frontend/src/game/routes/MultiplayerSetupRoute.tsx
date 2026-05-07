// create or join multiplayer game

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MultiplayerOption from "../../components/game/JoinOrCreate";
import { useAuth } from "../../hooks/useAuth";
import { usePlayerAvailability } from "../../hooks/usePlayerAvailability";

export default function MultiplayerSetupRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { availability } = usePlayerAvailability(user);

  useEffect(() => {
    if (!user) {
      navigate("/game");
      return;
    }

    if (availability?.gameId) {
      if (availability.phase === "PLAY") {
        navigate(`/game/${availability.gameId}`);
      } else {
        navigate(`/multiplayer/lobby/${availability.gameId}`);
      }
    }
  }, [user, availability, navigate]);

  return (
    <MultiplayerOption
      onCreate={() => navigate("/multiplayer/create")}
      onJoin={() => navigate("/multiplayer/join")}
      onBack={() => navigate("/game")}
    />
  );
}
