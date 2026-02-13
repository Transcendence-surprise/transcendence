import type { ReactNode } from "react";
import { MultiplayerSettings } from "../../game/models/gameSettings";
import SimpleButton from "../UI/SimpleButton";

type Props = {
  settings: MultiplayerSettings;
  onChange: (newSettings: MultiplayerSettings) => void;
  onCreate: () => void;
  onBack: () => void;
  error?: string | null;
  loading?: boolean;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

function SettingsField({ label, children }: FieldProps) {
  return (
    <label className="text-lg grid grid-cols-[180px_auto] items-center gap-x-4 justify-center text-center">
      <span className="text-[#00eaff] text-right">{label}</span>
      {children}
    </label>
  );
}

export default function MultiplayerSettingsForm({
  settings,
  onChange,
  onCreate,
  onBack,
  error,
  loading,
}: Props) {
  const selectClassName =
    "px-4 py-2 text-lg bg-gray-800 rounded border border-[#FFFFFF1A] focus:outline-none focus:border-cyan-200";
  const inputClassName =
    "px-4 py-2 text-lg bg-gray-800 rounded w-20 border border-[#FFFFFF1A] focus:outline-none focus:border-cyan-200";

  return (
    <div className="min-h-screen bg-black text-[#00eaff] font-mono flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.25),transparent_55%)] blur-2xl" />
        <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="absolute -right-10 bottom-6 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />

        <div className="relative rounded-2xl border border-[#FFFFFF1A] bg-[#0B0B0F] px-8 py-10 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-[#7BE9FF]">
              Lobby Setup
            </p>
            <h2 className="text-4xl font-bold drop-shadow-lg text-white">
              Multiplayer Settings
            </h2>
            <p className="text-sm text-[#B7F6FF] text-center max-w-md">
              Tune your lobby rules before inviting friends.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 ">
            <SettingsField label="Max Players">
              <select
                className={selectClassName}
                value={settings.maxPlayers}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    maxPlayers: Number(e.target.value) as 2 | 3 | 4,
                  })
                }
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </SettingsField>

            <SettingsField label="Allow Spectators">
              <input
                type="checkbox"
                className="h-5 w-5 accent-cyan-300"
                checked={settings.allowSpectators}
                onChange={(e) =>
                  onChange({ ...settings, allowSpectators: e.target.checked })
                }
              />
            </SettingsField>

            <SettingsField label="Board Size">
              <select
                className={selectClassName}
                value={settings.boardSize}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    boardSize: Number(e.target.value) as 6 | 7 | 8 | 9,
                  })
                }
              >
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
              </select>
            </SettingsField>

            <SettingsField label="Collectibles / Player">
              <input
                type="number"
                min={1}
                max={7}
                className={inputClassName}
                value={settings.collectiblesPerPlayer}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    collectiblesPerPlayer: Number(e.target.value),
                  })
                }
              />
            </SettingsField>
          </div>

          {error && <p className="mt-6 text-red-500 text-center">{error}</p>}

          <div className="mt-8 flex flex-col items-center gap-2">
            <div className={loading ? "opacity-60 pointer-events-none" : ""}>
              <SimpleButton title="Create Game" onClick={onCreate} />
            </div>
            <button
              className="text-sm underline text-blue-300"
              onClick={onBack}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
