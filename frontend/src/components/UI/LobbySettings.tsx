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
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-6 py-4">
      <h3 className="text-lg font-bold text-cyan-bright mb-3">
        Game Settings
      </h3>

      <div className="text-xs text-light-cyan space-y-1">
        <div>Max Players: {rules.maxPlayers}</div>
        <div>Board size: {rules.boardSize}</div>
        <div>Number of collectibles: {rules.collectiblesPerPlayer}</div>
        <div>Spectators: {rules.allowSpectators ? "Allowed" : "Not allowed"}</div>
      </div>
    </div>
  );
}