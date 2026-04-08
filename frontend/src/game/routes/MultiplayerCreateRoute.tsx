// Settings for multiplayer game creation

import { useEffect, useRef, useState } from "react";
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
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
     if (!user) {
      navigate("/game");
      return;
    }
  }, [settings, user]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  const nextSignal = () => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = new AbortController();
    return requestControllerRef.current.signal;
  };

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      const signal = nextSignal();
      const availability = await checkPlayerAvailability(signal);


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


      const game = await createGame({
        mode: 'MULTI',
        ...settings,
      }, signal);

      // Multiplayer always goes to lobby first
      navigate(`/multiplayer/lobby/${game.gameId}`);

    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(err.message || "Failed to create game");
      }
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
