// select level → create single player game

import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { getCurrentUser } from "../utils/fakeUser";
import { createGame } from "../../api/game";
import { GameSettings, SinglePlayerSettings } from "../models/gameSettings";
import SinglePlayerSettingsForm from "../../components/game/SinglePlayerSettings";

export default function SingleSetupRoute() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SinglePlayerSettings>({
    levelId: undefined,
    allowSpectators: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (settings: SinglePlayerSettings) => {
    if (!settings.levelId) {
      setError("Please choose a level");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // const hostId = getCurrentUser()?.id || "unknown";     // FAKE USER
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
