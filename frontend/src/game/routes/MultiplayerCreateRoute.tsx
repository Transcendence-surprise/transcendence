// Settings for multiplayer game creation

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getSecondUser } from "../utils/fakeUser";
import { createGame } from "../../api/game";
import { GameSettings, MultiplayerSettings } from "../models/gameSettings";
import MultiplayerSettingsForm from "../../components/game/MultiplayerSettings";


export default function MultiplayerCreateRoute() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<MultiplayerSettings>({
    maxPlayers: 2,
    boardSize: 6,
    allowSpectators: false,
    collectiblesPerPlayer: 5,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentUser = getCurrentUser(); // host                     FAKE
  const secondUser = getSecondUser();   // optional second player   FAKE

  console.log("currentUserId:", currentUser);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!currentUser) throw new Error("No fake user available");
      const hostId = currentUser.id;
      const game = await createGame(hostId, settings as GameSettings);

      // Multiplayer always goes to lobby first
      navigate(`/multiplayer/lobby/${game.gameId}`, {
        state: { currentUserId: currentUser.id },         // Can check with different FAKE users
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
