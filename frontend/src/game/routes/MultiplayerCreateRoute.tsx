// Settings for multiplayer game creation

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../../api/game";
import { MultiplayerSettings } from "../models/gameSettings";
import MultiplayerSettingsForm from "../../components/game/MultiplayerSettings";
import { useAuth } from "../../hooks/useAuth";
import { usePlayerAvailability } from "../../hooks/usePlayerAvailability";


export default function MultiplayerCreateRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<MultiplayerSettings>({
    maxPlayers: 2,
    boardSize: 6,
    allowSpectators: false,
    collectiblesPerPlayer: 5,
    turnDeadline: 30,
  });
  const requestControllerRef = useRef<AbortController | null>(null);
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
      if (availability?.gameId) {
        if (availability.phase === "PLAY") {
          navigate(`/game/${availability.gameId}`);
        } else {
          navigate(`/multiplayer/lobby/${availability.gameId}`);
        }
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
