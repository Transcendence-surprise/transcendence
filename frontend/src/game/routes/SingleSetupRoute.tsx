// select level → create single player game

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../../api/game";
import { SinglePlayerSettings } from "../models/gameSettings";
import SinglePlayerSettingsForm from "../../components/game/SinglePlayerSettings";
import { useAuth } from "../../hooks/useAuth";

export default function SingleSetupRoute() {
  const navigate = useNavigate();
  const requestControllerRef = useRef<AbortController | null>(null);
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
  }, [user, navigate]);

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
      const signal = nextSignal();

      const game = await createGame({
        mode: "SINGLE",
        ...settings,
      }, signal);

      navigate(`/game/${game.gameId}`);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Failed to create game:", err);
        setError(err.message || "Unknown error occurred");
      }
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
