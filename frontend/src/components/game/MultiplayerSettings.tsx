import type { ReactNode } from "react";
import { MultiplayerSettings } from "../../game/models/gameSettings";
import SimpleButton from "../shared/SimpleButton";

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
  hint?: string;
  children: ReactNode;
};

function SettingsField({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-3 rounded-xl border border-neutral-500/20 bg-black/20 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-bright">
          {label}
        </p>
        {hint ? (
          <p className="mt-1 text-sm leading-6 text-lightest-cyan/75">{hint}</p>
        ) : null}
      </div>
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
    "w-full rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark px-4 py-2.5 text-base text-white transition-colors focus:border-cyan-300 focus:outline-none sm:min-w-[112px] sm:w-auto";
  const inputClassName =
    "w-full rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark px-4 py-2.5 text-base text-white transition-colors focus:border-cyan-300 focus:outline-none sm:w-24";

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-4xl">
        <div className="absolute -inset-1 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.14),transparent_32%)] blur-2xl" />
        <div className="absolute -left-10 top-12 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -right-10 bottom-8 h-32 w-32 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-6 py-8 shadow-dark-lg sm:px-8 sm:py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
              Lobby Setup
            </p>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">
              Multiplayer Settings
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-lightest-cyan/80 sm:text-base">
              Configure your match before creating the lobby. These settings
              control player count, board scale, collectibles, and the pace of each turn.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {settings.maxPlayers} Players
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {settings.boardSize}x{settings.boardSize} Board
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {settings.collectiblesPerPlayer} Collectibles
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {settings.turnDeadline ?? 30}s Turns
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              Spectators {settings.allowSpectators ? "On" : "Off"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <SettingsField
              label="Max Players"
              hint="Choose how many players can join this multiplayer match."
            >
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

            <SettingsField
              label="Allow Spectators"
              hint="Let extra users join the lobby as viewers without taking a player slot."
            >
              <button
                type="button"
                role="switch"
                aria-checked={settings.allowSpectators}
                onClick={() =>
                  onChange({
                    ...settings,
                    allowSpectators: !settings.allowSpectators,
                  })
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
                  settings.allowSpectators
                    ? "border-cyan-300/50 bg-cyan-400/35"
                    : "border-[var(--color-border-subtle)] bg-bg-dark"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.allowSpectators ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </SettingsField>

            <SettingsField
              label="Board Size"
              hint="Larger boards create longer routes and more room for strategy."
            >
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

            <SettingsField
              label="Collectibles / Player"
              hint="Set how many objectives each player needs to collect."
            >
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

            <SettingsField
              label="Move Time Limit"
              hint="Time available for each turn before the move expires."
            >
              <input
                type="number"
                min={5}
                max={300}
                className={inputClassName}
                value={settings.turnDeadline ?? 30}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    turnDeadline: Number(e.target.value),
                  })
                }
              />
            </SettingsField>
          </div>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
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
            <button
              className="text-sm text-light-cyan underline underline-offset-4 transition-colors hover:text-cyan-bright"
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
