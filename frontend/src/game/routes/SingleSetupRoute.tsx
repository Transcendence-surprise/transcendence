// select level → create single player game

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../../api/game";
import { SinglePlayerSettings } from "../models/gameSettings";
import SinglePlayerSettingsForm from "../../components/game/SinglePlayerSettings";
import { useAuth } from "../../hooks/useAuth";

export default function SingleSetupRoute() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SinglePlayerSettings>({
    levelId: undefined,
    allowSpectators: false,
  });
  
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     if (!user) {
      navigate("/game");
      return;
    }
  }, [settings, user, navigate]);

  const handleCreate = async (settings: SinglePlayerSettings) => {

    if (!user) {
      navigate("/game");
      return;
    }

    if (!settings.levelId) {
      setError("Please choose a level");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const game = await createGame({
        mode: "SINGLE",
        ...settings,
      });

      navigate(`/game/${game.gameId}`);
    } catch (err: any) {
      console.error("Failed to create game:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SinglePlayerSettingsForm
      settings={settings}
      onChange={(newSettings) => setSettings({ ...settings, ...newSettings })}
      onCreate={async () => await handleCreate(settings)}
      onBack={() => navigate("/game")}              // back to mode selection
      error={error}
      loading={loading}
    />
  );
}
