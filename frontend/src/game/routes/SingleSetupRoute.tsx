// select level → create single player game

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTempUserId } from "../utils/randomUser";
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
    try {
      setError(null);
      setLoading(true);

      const hostId = generateTempUserId(); // temp user ID
      const game: { ok: boolean; gameId: string } = await createGame(hostId, {
        mode: "SINGLE",
        ...settings,
      } as GameSettings);

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
      onChange={setSettings}
      onCreate={() => handleCreate(settings)}
      onBack={() => navigate("/game")}              // back to mode selection
      error={error}
      loading={loading}
    />
  );
}
