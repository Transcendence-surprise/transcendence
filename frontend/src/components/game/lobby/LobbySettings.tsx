type LobbyRules = {
  mode: string;
  maxPlayers: number;
  allowSpectators: boolean;
  collectiblesPerPlayer: number;
  fixedCorners: boolean;
  requiresBoardActionPerTurn: boolean;
  boardSize: number;
};

type LobbySettingsProps = {
  rules: LobbyRules;
};

export function LobbySettings({ rules }: LobbySettingsProps) {
  const items = [
    { label: "Max Players", value: rules.maxPlayers },
    { label: "Board Size", value: rules.boardSize },
    { label: "Collectibles", value: rules.collectiblesPerPlayer },
    { label: "Spectators", value: rules.allowSpectators ? "Allowed" : "Off" },
  ];

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-5 py-5 shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
      <h3 className="text-xl font-bold text-cyan-bright">Game Settings</h3>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
        Match rules
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-neutral-500 bg-black/20 px-3 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
      </div>
    </div>
  );
}
