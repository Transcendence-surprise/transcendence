import { useEffect, useState } from "react";
import { SinglePlayerSettings } from "../../game/models/gameSettings";
import { SingleLevel } from "../../game/models/singleLevel";
import { getSingleLevels } from "../../api/game";
import BackButton from "../shared/BackButton";
import CustomSelect from "../shared/CustomSelect";
import InfoChip from "../shared/InfoChip";
import SettingsField from "../shared/SettingsField";
import SimpleButton from "../shared/SimpleButton";

type Props = {
  settings: SinglePlayerSettings;
  onChange: (newSettings: SinglePlayerSettings) => void;
  onCreate: () => void;
  onBack: () => void;
  error?: string | null;
  loading?: boolean;
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

  const levelOptions = [
    { label: "Select Level", value: "" },
    ...levels.map((level) => ({
      label: level.name,
      value: level.id,
    })),
  ];

  const selectedLevel =
    levels.find((level) => level.id === settings.levelId) ?? null;

  if (loadingLevels) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 py-10 font-sans text-white">
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-8 py-8 text-center shadow-dark-lg">
          <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
            Single Player
          </p>
          <p className="mt-3 text-lg font-semibold text-cyan-bright">
            Loading levels...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 py-10 font-sans text-white">
      <div className="relative w-full max-w-4xl">
        <div className="absolute -inset-1 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.14),transparent_32%)] blur-2xl" />
        <div className="absolute -left-10 top-12 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -right-10 bottom-8 h-32 w-32 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-6 py-8 shadow-dark-lg sm:px-8 sm:py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
              Solo Run
            </p>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">
              Single Player Settings
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-lightest-cyan/80 sm:text-base">
              Pick a level and launch a solo match with the same polished setup
              flow as multiplayer.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <InfoChip>
              {selectedLevel ? selectedLevel.name : "No level selected"}
            </InfoChip>
            <InfoChip variant="muted">
              {levels.length} Levels Available
            </InfoChip>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4">
            <SettingsField
              label="Level"
              hint="Choose the puzzle layout you want to play in this single-player run."
            >
              <CustomSelect
                className="w-full sm:min-w-[240px]"
                value={settings.levelId || ""}
                onChange={(value) =>
                  onChange({ ...settings, levelId: value || undefined })
                }
                options={levelOptions}
              />
            </SettingsField>
          </div>

          {error ? (
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className={loading ? "pointer-events-none opacity-60" : ""}>
              <SimpleButton
                title={loading ? "Creating..." : "Create Game"}
                onClick={onCreate}
                disabled={loading}
                className="w-56"
              />
            </div>
            <BackButton onClick={onBack} />
          </div>
        </div>
      </div>
    </div>
  );
}
