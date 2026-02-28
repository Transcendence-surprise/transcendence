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
    <div className="rounded-lg border border-[#FFFFFF1A] bg-[#101019] px-6 py-4">
      <h3 className="text-lg font-bold text-[#00eaff] mb-3">Players</h3>
      <p className="text-sm text-[#B7F6FF] mb-4">
        {players.length} / {maxPlayers}
      </p>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 text-sm text-[#B7F6FF]"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            {player.displayName} {player.id === hostId ? "(Host)" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
