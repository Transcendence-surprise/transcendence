import { useEffect, useState } from "react";
import { SinglePlayerSettings } from "../../game/models/gameSettings";
import { SingleLevel } from "../../game/models/singleLevel";
import { getSingleLevels } from "../../api/game";
import SimpleButton from "../shared/SimpleButton";

type Props = {
  settings: SinglePlayerSettings;
  onChange: (newSettings: SinglePlayerSettings) => void;
  onCreate: () => void;
  onBack: () => void;
  error?: string | null;      // <-- add this
  loading?: boolean;          // <-- add this
};

export default function SinglePlayerSettingsForm({
  settings,
  onChange,
  onCreate,
  onBack,
  loading,
  error,
}: Props) {
  const [levels, setLevels] = useState<SingleLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getSingleLevels(controller.signal)
      .then(setLevels)
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error(err);
        }
      })
      .finally(() => setLoadingLevels(false));

    return () => {
      controller.abort();
    };
  }, []);

  if (loadingLevels) return <div>Loading levels...</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans flex flex-col items-center justify-center space-y-10">
      <h2 className="text-4xl font-bold drop-shadow-lg">Single Player Settings</h2>

      {error && <p className="text-red-500">{error}</p>}

      <label className="text-lg">
        Level:
        <select
          className="ml-2 px-4 py-2 text-lg bg-gray-800 rounded"
          value={settings.levelId || ""}
          onChange={(e) => onChange({ ...settings, levelId: e.target.value })}
        >
          <option value="">Select Level</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </label>
      <SimpleButton title="Create Game" onClick={onCreate} disabled={loading} />
      <button
        className="mt-2 text-sm underline text-blue-300"
        onClick={onBack}
        >
          Back
      </button>
    </div>
  );
}
