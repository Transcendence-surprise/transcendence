// Settings for multiplayer game creation

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, checkPlayerAvailability } from "../../api/game";
import { MultiplayerSettings } from "../models/gameSettings";
import MultiplayerSettingsForm from "../../components/game/MultiplayerSettings";
import { useAuth } from "../../hooks/useAuth";


export default function MultiplayerCreateRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [settings, setSettings] = useState<MultiplayerSettings>({
    maxPlayers: 2,
    boardSize: 6,
    allowSpectators: false,
    collectiblesPerPlayer: 5,
  });

  useEffect(() => {
     if (!user) {
      navigate("/game");
      return;
    }
    console.log("🔧 Multiplayer settings changed:", settings);
  }, [settings, user]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {

      const availability = await checkPlayerAvailability();

      console.log("🚀 Creating game with settings:", settings);

      if (!availability.ok) {
        if (!availability.gameId) {
          setError("Player is busy but no game found.");
          return;
        }
        navigate(
          availability.phase === "PLAY"
            ? `/game/${availability.gameId}`
            : `/multiplayer/lobby/${availability.gameId}`
        );
        return;
      }

      console.log("Player is available", settings);

      const game = await createGame({
        mode: 'MULTI',
        ...settings,
      });

      // Multiplayer always goes to lobby first
      navigate(`/multiplayer/lobby/${game.gameId}`);

    } catch (err: any) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
};

  return (
    <MultiplayerSettingsForm
      settings={settings}
      onChange={setSettings}
      onCreate={handleCreate}
      onBack={() => navigate("/game")}
      error={error}
      loading={loading}
    />
  );
}
