import { useState } from "react";
import { GameSettings } from "../models/gameSettings";
import GameModePicker from "../../components/game/GameModePicker";
import SinglePlayerSettingsForm from "../../components/game/SinglePlayerSettings";
import MultiplayerSettingsForm from "../../components/game/MultiplayerSettings";

type Props = {
  onBack: () => void;
  onCreate: (settings: GameSettings) => void;
};

export default function GameSetupPage({ onBack, onCreate }: Props) {
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

  if (!gameSettings) return <GameModePicker onBack={onBack} onSelectMode={setGameSettings} />;

  if (gameSettings.mode === "SINGLE") // Check mode == SINGLE
    return (
      <SinglePlayerSettingsForm
        settings={gameSettings}
        // onChange is a callback the form calls when the user changes something (like selecting a level).
        onChange={(newSettings) =>
          setGameSettings({ ...gameSettings, ...newSettings }) // Call Single mode settings
        }
        onCreate={() => onCreate(gameSettings)}                 // “Create Game” is clicked, ask patern (Index) to call back API via handleCreateGame
        onBack={() => setGameSettings(null)}                    // Resets gameSettings to null
      />
    );

if (gameSettings.mode === "MULTI") // Check mode == MULTI
  return (
    <MultiplayerSettingsForm
      settings={gameSettings}
      onChange={(newSettings) =>
        setGameSettings({ ...gameSettings, ...newSettings })
      }
      onCreate={() => onCreate(gameSettings)}
      onBack={() => setGameSettings(null)}
    />
  );

  return null;
}
