// Settings for multiplayer game creation

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTempUserId } from "../utils/randomUser";
import { createGame } from "../../api/game";
import { GameSettings, MultiplayerSettings } from "../models/gameSettings";
import MultiplayerSettingsForm from "../../components/game/MultiplayerSettings";


export default function MultiplayerCreateRoute() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<MultiplayerSettings>({
    maxPlayers: 2,
    boardSize: 6,
    allowSpectators: false,
    collectiblesPerPlayer: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      const hostId = generateTempUserId();
      const game = await createGame(hostId, settings as GameSettings);

      // Multiplayer always goes to lobby first // LOBBY CALLED HERE
      navigate(`/multiplayer/lobby/${game.gameId}`, {
        state: { hostId, currentUserId: hostId },
      });

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
