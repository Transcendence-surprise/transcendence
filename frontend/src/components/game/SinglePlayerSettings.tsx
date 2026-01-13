import { useEffect, useState } from "react";
import { SinglePlayerSettings } from "../../game/models/gameSettings";
import { SingleLevel } from "../../game/models/singleLevel";
import { getSingleLevels } from "../../api/game";

type Props = {
  settings: SinglePlayerSettings;
  onChange: (newSettings: SinglePlayerSettings) => void;
  onCreate: () => void;
  onBack: () => void;
};

export default function SinglePlayerSettingsForm({
  settings,
  onChange,
  onCreate,
  onBack,
}: Props) {
  const [levels, setLevels] = useState<SingleLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSingleLevels()
      .then(setLevels)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading levels...</div>;

  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Single Player Settings</h2>

      <label>
        Level:
        <select
          className="ml-2 px-2 py-1 bg-gray-800 rounded"
          value={settings.levelId || ""}
          onChange={(e) => onChange({ ...settings, levelId: e.target.value })}
        >
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </label>

      <button
        className="px-6 py-3 bg-green-600 rounded-lg shadow-lg hover:bg-green-500 transition-all"
        onClick={onCreate}
        disabled={!settings.levelId} // cannot create without selection
      >
        Create Game
      </button>

      <button className="mt-2 text-sm underline text-blue-300" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
