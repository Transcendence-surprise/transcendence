import { MultiplayerSettings } from "../../game/models/gameSettings";
import CustomSelect from "../shared/CustomSelect";
import InfoChip from "../shared/InfoChip";
import SettingsField from "../shared/SettingsField";
import BackButton from "../shared/BackButton";
import SimpleButton from "../shared/SimpleButton";

type Props = {
  settings: MultiplayerSettings;
  onChange: (newSettings: MultiplayerSettings) => void;
  onCreate: () => void;
  onBack: () => void;
  error?: string | null;
  loading?: boolean;
};

export default function MultiplayerSettingsForm({
  settings,
  onChange,
  onCreate,
  onBack,
  error,
  loading,
}: Props) {
  const normalizeTurnDeadline = (value: string) => {
    if (value.trim() === "") {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return settings.turnDeadline ?? 30;
    }

    return Math.min(300, Math.max(30, parsed));
  };

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
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <InfoChip>
              {settings.maxPlayers} Players
            </InfoChip>
            <InfoChip>
              {settings.boardSize}x{settings.boardSize} Board
            </InfoChip>
            <InfoChip>
              {settings.collectiblesPerPlayer} Collectibles
            </InfoChip>
            <InfoChip>
              {settings.turnDeadline ?? 30}s Turns
            </InfoChip>
            <InfoChip>
              Spectators {settings.allowSpectators ? "On" : "Off"}
            </InfoChip>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <SettingsField
              label="Max Players"
              hint="Choose how many players can join this multiplayer match."
            >
              <CustomSelect
                className="w-full sm:min-w-[112px] sm:w-auto"
                value={settings.maxPlayers}
                onChange={(value) =>
                  onChange({
                    ...settings,
                    maxPlayers: value,
                  })
                }
                options={[
                  { label: "2", value: 2 },
                  { label: "3", value: 3 },
                  { label: "4", value: 4 },
                ]}
              />
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
              <CustomSelect
                className="w-full sm:min-w-[112px] sm:w-auto"
                value={settings.boardSize}
                onChange={(value) =>
                  onChange({
                    ...settings,
                    boardSize: value,
                  })
                }
                options={[
                  { label: "6", value: 6 },
                  { label: "7", value: 7 },
                  { label: "8", value: 8 },
                  { label: "9", value: 9 },
                ]}
              />
            </SettingsField>

            <SettingsField
              label="Move Time Limit"
              hint="Time available for each turn before the move expires."
            >
              <input
                type="number"
                min={30}
                max={300}
                className={inputClassName}
                value={settings.turnDeadline ?? 30}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    turnDeadline: normalizeTurnDeadline(e.target.value),
                  })
                }
              />
            </SettingsField>
            <SettingsField
              label="Collectibles / Player"
              hint="Set how many objectives each player needs to collect."
            >
              <CustomSelect
                className="w-full sm:min-w-[112px] sm:w-auto"
                value={settings.collectiblesPerPlayer}
                onChange={(value) =>
                  onChange({
                    ...settings,
                    collectiblesPerPlayer: value,
                  })
                }
                options={[
                  { label: "1", value: 1 },
                  { label: "2", value: 2 },
                  { label: "3", value: 3 },
                  { label: "4", value: 4 },
                  { label: "5", value: 5 },
                  { label: "6", value: 6 },
                  { label: "7", value: 7 },
                ]}
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
            <BackButton onClick={onBack} />
          </div>
        </div>
      </div>
    </div>
  );
}
