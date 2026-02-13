type PlayerListProps = {
  players: Array<{ id: string }>;
  currentUserId: string;
  maxPlayers: number;
};

export default function PlayerList({
  players,
  currentUserId,
  maxPlayers,
}: PlayerListProps) {
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
            {player.id}
            {player.id === currentUserId && (
              <span className="text-xs text-cyan-300 ml-auto">(You)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
