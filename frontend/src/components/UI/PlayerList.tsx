type PlayerListProps = {
  players: { id: number; displayName: string }[];
  hostId: number;
  maxPlayers: number;
};

export default function PlayerList({
  players,
  hostId,
  maxPlayers,
}: PlayerListProps) {
  console.log("PlayerList received:", players);
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-6 py-4">
      <h3 className="text-lg font-bold text-cyan-bright mb-3">Players</h3>
      <p className="text-sm text-lightest-cyan mb-4">
        {players.length} / {maxPlayers}
      </p>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 text-sm text-lightest-cyan"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            {player.displayName} {player.id === hostId ? "(Host)" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
